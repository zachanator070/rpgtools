import bodyParser from "body-parser";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import { existsSync } from "fs";
import http, { request, Server } from "http";
import { ApolloServer, GraphQLResponse } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@as-integrations/express4';
import express, { Express, Request, Response, NextFunction } from "express";
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
import { ValidationError } from "sequelize";
import Logger from "../logging/logger.js";
import requestLoggerMiddleware from "./request-logger-middleware.js";
import {AuthenticationService} from "../services/authentication-service.js";
import {ServerConfigService} from "../services/server-config-service.js";
import {ServerProperties} from "./server-properties.js";
import {createSsoRouter} from "../routers/sso-router.js";

@injectable()
export class ExpressApiServer implements ApiServer {
	DEFAULT_PORT = 3000;

	httpServer: Server = null;
	expressServer: Express = null;
	gqlServer: ApolloServer = null;
	webSocketServer: WebSocketServer = null;
	sessionContextFactory: ExpressSessionContextFactory;
	authenticationService: AuthenticationService;
	serverConfigService: ServerConfigService;
	serverProperties: ServerProperties;

	logger: Logger;

	// use constructor injection so middleware can capture injectables
	constructor(@inject(INJECTABLE_TYPES.SessionContextFactory)
					sessionContextFactory: ExpressSessionContextFactory, 
				@inject(INJECTABLE_TYPES.Logger) logger: Logger,
				@inject(INJECTABLE_TYPES.AuthenticationService) authenticationService: AuthenticationService,
				@inject(INJECTABLE_TYPES.ServerConfigService) serverConfigService: ServerConfigService,
				@inject(INJECTABLE_TYPES.ServerProperties) serverProperties: ServerProperties) {

		this.sessionContextFactory = sessionContextFactory;
		this.logger = logger;
		this.authenticationService = authenticationService;
		this.serverConfigService = serverConfigService;
		this.serverProperties = serverProperties;
		
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
				// Plugin to enrich errors with Sequelize validation details when present
				{
					async requestDidStart() {
						return {
							async didEncounterErrors(ctx: any): Promise<void> {
								for (const err of ctx.errors || []) {
									const original = (err as any).originalError || (err as any).extensions?.exception || (err as any).extensions?.originalError;
									if (!original) continue;
									if (original instanceof ValidationError || original.name === 'SequelizeValidationError') {
										const sequelizeError = original.original || original;
										const details = {
											message: sequelizeError.message,
											path: sequelizeError.path,
											value: sequelizeError.value,
											type: sequelizeError.type,
										};
										(err as any).extensions = {
											...(err as any).extensions,
											sequelize: { details },
											code: 'SEQUELIZE_VALIDATION_ERROR',
										};
									}
								}
							},
						};
					},
				},
			]
		});

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
		const currentDir = import.meta.dirname;
		// /opt/rpgtools/packages/server/dist/frontend
		// need to output in the server package so electron app is packaged with UI bundle
		const uiPath = path.resolve(currentDir, '..', '..', '..', '..', 'dist', 'frontend');

		await this.gqlServer.start();
		this.expressServer.use(bodyParser.json({limit: "5mb"}));
		this.expressServer.use(bodyParser.urlencoded({extended: true}));
		this.expressServer.use(requestLoggerMiddleware(this.logger));

		this.expressServer.use(cookieParser());
		// Apply the expressRequestContextMiddleware to set up session context for both /graphql and REST endpoints
		this.expressServer.use(expressRequestContextMiddleware(this.sessionContextFactory));

		this.expressServer.use(graphqlUploadExpress());

		// Middleware to log GraphQL errors in the response
		this.expressServer.use("/graphql", (_: Request, res: Response, next: NextFunction) => {
			// Intercept the response send method
			const originalSend = res.send;
			res.send = function (body: any) {
				try {
					const json = typeof body === 'string' ? JSON.parse(body) : body;
					if (json && json.errors) {
						this.logger.error("GraphQL Errors", json.errors);
					}
				} catch (e) {
					// Ignore JSON parse errors
				}
				return originalSend.call(this, body);
			};
			next();
		});

		this.expressServer.use("/graphql",
				expressMiddleware(this.gqlServer, {
				context: async ({req, res}: {req: Request, res: Response}) => {
					// constructed already by the expressRequestContextMiddleware. 
					return req.app.locals.context;
				},
			}),
		);

		this.expressServer.use(
			"/auth/sso",
			createSsoRouter(this.logger, this.authenticationService, this.serverConfigService, this.serverProperties)
		);

		this.expressServer.get("*.js", function (req: Request, res: Response, next: NextFunction) {
			const gzAssetPath = path.join(uiPath, `${req.path}.gz`);
			if (existsSync(gzAssetPath)) {
				req.url = req.url + ".gz";
				res.set("Content-Encoding", "gzip");
				res.set("Content-Type", "text/javascript");
			}
			next();
		});
		this.expressServer.get("*.css", function (req: Request, res: Response, next: NextFunction) {
			const gzAssetPath = path.join(uiPath, `${req.path}.gz`);
			if (existsSync(gzAssetPath)) {
				req.url = req.url + ".gz";
				res.set("Content-Encoding", "gzip");
				res.set("Content-Type", "text/css");
			}
			next();
		});

		this.expressServer.use("/images", ImageRouter);
		this.expressServer.use("/models", ModelRouter);
		this.expressServer.use("/export", ExportRouter);

		this.expressServer.get("/ui*", (_: Request, res: Response) => {
			return res.sendFile(path.resolve(uiPath, "index.html"));
		});

		this.expressServer.use(express.static(uiPath));

		this.expressServer.use(cors({
			origin: ["https://studio.apollographql.com"],
			credentials: true
		}));
	};

	startListen = async () => {
		const port = process.env.SERVER_PORT || this.DEFAULT_PORT;
		this.httpServer.listen(port, () => {
			this.logger.info(`The server is running and listening at http://localhost:${port}`);
		});
	};

	start = async () => {
		await this.applyMiddleware();
		await this.startListen();
	};

}
