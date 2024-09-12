import bodyParser from "body-parser";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import http, { Server } from "http";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import express, { Express } from "express";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import { inject, injectable } from "inversify";
import {
	ApiServer,
	CookieManager,
} from "../types";
import { graphqlUploadExpress } from "graphql-upload";
import { ModelRouter } from "../routers/model-router";
import ExportRouter from "../routers/export-router";
import { ImageRouter } from "../routers/image-router";
import { typeDefs } from "../gql-server-schema";
import { allResolvers } from "../resolvers/all-resolvers";
import { DocumentNode } from "graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import {GraphQLRequest} from "apollo-server-types";
import cors from "cors";
import {ExpressCookieManager} from "./express-cookie-manager";
import * as url from 'url';
import {expressRequestContextMiddleware} from "../middleware/express-request-context-middleware";
import {ExpressSessionContextFactory} from "./express-session-context-factory";

@injectable()
export class ExpressApiServer implements ApiServer {
	DEFAULT_PORT = 3000;

	httpServer: Server = null;
	expressServer: Express = null;
	gqlServer: ApolloServer = null;
	webSocketServer: WebSocketServer = null;

	// use constructor injection so middleware can capture injectables
	constructor(@inject(INJECTABLE_TYPES.SessionContextFactory)
					sessionContextFactory: ExpressSessionContextFactory) {

		const schema = makeExecutableSchema({ typeDefs, resolvers: allResolvers });

		this.expressServer = express();
		this.httpServer = http.createServer(this.expressServer);
		this.webSocketServer = new WebSocketServer(
			{
				server: this.httpServer,
				path: '/subscriptions',
			}
		);

		const serverCleanup = useServer({
			schema,
			context: (params) => {
				return sessionContextFactory.create(params.connectionParams.accessToken as string, params.connectionParams.refreshToken as string, null);
			},
		}, this.webSocketServer);
		this.gqlServer = new ApolloServer({
			introspection: true,
			schema,
			context: async ({req, res}) => {
				const cookieManager: CookieManager = new ExpressCookieManager(res);

				const refreshToken: string = req?.cookies["refreshToken"];
				const accessToken: string = req?.cookies["accessToken"];
				const context = await sessionContextFactory.create(accessToken, refreshToken, cookieManager);
				if (res) {
					res.locals.session = context;
				}
				return context;
			},
			csrfPrevention: true,
			plugins: [
				ApolloServerPluginDrainHttpServer({httpServer: this.httpServer}),
				{
					async serverWillStart() {
						return {
							async drainServer() {
								await serverCleanup.dispose();
							},
						};
					},
				},

			]
		});

		this.expressServer.use(bodyParser.json({limit: "5mb"}));
		this.expressServer.use(morgan("tiny"));

		this.expressServer.use(cookieParser());

		this.expressServer.get("*.js", function (req, res, next) {
			req.url = req.url + ".gz";
			res.set("Content-Encoding", "gzip");
			res.set("Content-Type", "text/javascript");
			next();
		});
		this.expressServer.get("*.css", function (req, res, next) {
			req.url = req.url + ".gz";
			res.set("Content-Encoding", "gzip");
			res.set("Content-Type", "text/css");
			next();
		});

		this.expressServer.use(expressRequestContextMiddleware(sessionContextFactory));

		this.expressServer.use("/images", ImageRouter);
		this.expressServer.use("/models", ModelRouter);
		this.expressServer.use("/export", ExportRouter);

		const __dirname = url.fileURLToPath(new URL('.'));
		// /opt/rpgtools/packages/server/dist/frontend
		// need to output in the server package so electron app is packaged with UI bundle
		const uiPath = path.resolve(__dirname, '..', '..', '..', '..', 'dist', 'frontend');

		this.expressServer.get("/ui*", (req, res) => {
			return res.sendFile(path.resolve(uiPath, "index.html"));
		});

		this.expressServer.use(express.static(uiPath));
		this.expressServer.use(graphqlUploadExpress());

		this.expressServer.use(cors({
			origin: ["https://studio.apollographql.com"],
			credentials: true
		}));

		this.expressServer.set('trust proxy', process.env.NODE_ENV !== 'production')
	}

	executeGraphQLQuery = async (
		request: Omit<GraphQLRequest, "query"> & {
			query?: string | DocumentNode;
		}
	) => this.gqlServer.executeOperation(request);

	applyMiddleware = async () => {
		await this.gqlServer.start();
		this.gqlServer.applyMiddleware({ app: this.expressServer, path: "/graphql", cors: false });
	};

	startListen = async () => {
		const port = process.env.SERVER_PORT || this.DEFAULT_PORT;
		this.httpServer.listen(port, () => {
			console.log(`The server is running and listening at http://localhost:${port}`);
		});
	};

	start = async () => {
		await this.applyMiddleware();
		await this.startListen();
	};

}
