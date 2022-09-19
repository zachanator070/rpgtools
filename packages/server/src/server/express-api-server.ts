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
	CookieManager, SessionContext,
	SessionContextFactory
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
import {GraphQLRequest, GraphQLRequestContextWillSendResponse} from "apollo-server-types";
import cors from "cors";
import {ExpressCookieManager} from "./express-cookie-manager";
import {RoleRepository} from "../dal/repository/role-repository";
import {ServerConfigRepository} from "../dal/repository/server-config-repository";
import {UserRepository} from "../dal/repository/user-repository";
import {ApolloServerPlugin, BaseContext, GraphQLRequestListener} from 'apollo-server-plugin-base';

@injectable()
export class ExpressApiServer implements ApiServer {
	DEFAULT_PORT = 3000;

	httpServer: Server = null;
	expressServer: Express = null;
	gqlServer: ApolloServer = null;
	webSocketServer: WebSocketServer = null;

	@inject(INJECTABLE_TYPES.RoleRepository)
	roleRepository: RoleRepository;
	@inject(INJECTABLE_TYPES.UserRepository)
	userRepository: UserRepository;
	@inject(INJECTABLE_TYPES.ServerConfigRepository)
	serverConfigRepository: ServerConfigRepository;

	@inject(INJECTABLE_TYPES.SessionContextFactory)
	sessionContextFactory: SessionContextFactory

	constructor() {
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
				return this.sessionContextFactory.create(params.connectionParams.accessToken as string, params.connectionParams.refreshToken as string, null);
			},
		}, this.webSocketServer);
		const closeSessionPlugin: ApolloServerPlugin = {
			requestDidStart: async (): Promise<GraphQLRequestListener<BaseContext> | void> => {
				return {
					willSendResponse: async (requestContext: GraphQLRequestContextWillSendResponse<GraphQLRequestContextWillSendResponse<"response">>) => {
						const context: SessionContext = requestContext.context as unknown as SessionContext;
						await context.databaseContext.databaseSession.commit();
					}
				}
			}

		};
		this.gqlServer = new ApolloServer({
			schema,
			context: async ({req, res}) => {
				const cookieManager: CookieManager = new ExpressCookieManager(res);

				const refreshToken: string = req?.cookies["refreshToken"];
				const accessToken: string = req?.cookies["accessToken"];
				const session = await this.sessionContextFactory.create(accessToken, refreshToken, cookieManager);
				if (res) {
					res.locals.session = session;
				}
				return session;
			},
			csrfPrevention: true,
			plugins: [
				ApolloServerPluginDrainHttpServer({httpServer: this.httpServer}),
				closeSessionPlugin,
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
		this.expressServer.get("*favicon.ico", function (req, res, next) {
			req.url = "/favicon.ico";
			next();
		});

		this.expressServer.use("/images", ImageRouter);
		this.expressServer.use("/models", ModelRouter);
		this.expressServer.use("/export", ExportRouter);

		this.expressServer.get("/ui*", (req, res) => {
			return res.sendFile(path.resolve("../frontend/dist", "index.html"));
		});

		this.expressServer.use(express.static("../frontend/dist"));
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
