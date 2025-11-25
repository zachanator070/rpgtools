import bodyParser from "body-parser";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import http, { Server } from "http";
import { ApolloServer, GraphQLRequest, GraphQLResponse } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@as-integrations/express4';
import express, { Express } from "express";
import { INJECTABLE_TYPES } from "../di/injectable-types.js";
import { inject, injectable } from "inversify";
import {
	ApiServer,
	ApiServerRequest,
	CookieManager,
} from "../types.js";
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";
import { ModelRouter } from "../routers/model-router.js";
import ExportRouter from "../routers/export-router.js";
import { ImageRouter } from "../routers/image-router.js";
import { typeDefs } from "../gql-server-schema.js";
import { allResolvers } from "../resolvers/all-resolvers.js";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from 'ws';
// @ts-ignore
import { useServer } from 'graphql-ws/use/ws';
import cors from "cors";
import {ExpressCookieManager} from "./express-cookie-manager.js";
import {expressRequestContextMiddleware} from "../middleware/express-request-context-middleware.js";
import {ExpressSessionContextFactory} from "./express-session-context-factory.js";

@injectable()
export class ExpressApiServer implements ApiServer {
	DEFAULT_PORT = 3000;

	httpServer: Server = null;
	expressServer: Express = null;
	gqlServer: ApolloServer = null;
	webSocketServer: WebSocketServer = null;
	sessionContextFactory: ExpressSessionContextFactory;

	// use constructor injection so middleware can capture injectables
	constructor(@inject(INJECTABLE_TYPES.SessionContextFactory)
					sessionContextFactory: ExpressSessionContextFactory) {

		this.sessionContextFactory = sessionContextFactory;
		
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
			context: (params: any) => {
				return sessionContextFactory.create(params.connectionParams.accessToken as string, params.connectionParams.refreshToken as string, null);
			},
		}, this.webSocketServer);
		this.gqlServer = new ApolloServer({
			introspection: true,
			schema,
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

		const currentDir = import.meta.dirname;
		// /opt/rpgtools/packages/server/dist/frontend
		// need to output in the server package so electron app is packaged with UI bundle
		const uiPath = path.resolve(currentDir, '..', '..', '..', '..', 'dist', 'frontend');

		this.expressServer.get("/ui*", (req, res) => {
			return res.sendFile(path.resolve(uiPath, "index.html"));
		});

		this.expressServer.use(express.static(uiPath));

		this.expressServer.set('trust proxy', process.env.NODE_ENV !== 'production');
	}

	executeGraphQLQuery = async (
		request: ApiServerRequest,
	) => {
		const response: GraphQLResponse = await this.gqlServer.executeOperation(request, {
			// this function is only used in a testing context, so no parameters are expected when creating the session context
			contextValue: await this.sessionContextFactory.create(undefined, undefined),
		});
		if (response.body.kind === 'single') {
			return {
				data: response.body.singleResult.data,
				errors: response.body.singleResult.errors,
			};
		}
		else if (response.body.kind === 'incremental') {
			const data = [];
			for await (const chunk of response.body.subsequentResults) {
				if (chunk) {
					data.push(chunk);
				}
			}
			return {
				data: {
					...response.body.initialResult.data,
					...data,
				},
				errors: response.body.initialResult.errors,
			};
		}
	}

	applyMiddleware = async () => {
		await this.gqlServer.start();
		this.expressServer.use(bodyParser.json({limit: "5mb"}));
		this.expressServer.use(morgan("tiny"));

		this.expressServer.use(cookieParser());
		this.expressServer.use("/graphql",
			expressMiddleware(this.gqlServer, {
				context: async ({req, res}) => {
					const cookieManager: CookieManager = new ExpressCookieManager(res);

					const refreshToken: string = req?.cookies["refreshToken"];
					const accessToken: string = req?.cookies["accessToken"];
					const context = await this.sessionContextFactory.create(accessToken, refreshToken, cookieManager);
					if (res) {
						res.locals.session = context;
					}
					return context;
				},
			}),
		);
		this.expressServer.use(graphqlUploadExpress());

		this.expressServer.use(cors({
			origin: ["https://studio.apollographql.com"],
			credentials: true
		}));
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
