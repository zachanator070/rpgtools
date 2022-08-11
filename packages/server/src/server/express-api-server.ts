import bodyParser from "body-parser";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import { SERVER_ADMIN_ROLE } from "@rpgtools/common/src/permission-constants";
import http, { Server } from "http";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import express, { Express } from "express";
import mongoose from "mongoose";
import { MongodbRoleRepository } from "../dal/mongodb/repositories/mongodb-role-repository";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import { inject, injectable } from "inversify";
import { MongodbUserRepository } from "../dal/mongodb/repositories/mongodb-user-repository";
import { MongodbServerConfigRepository } from "../dal/mongodb/repositories/mongodb-server-config-repository";
import { FilterCondition } from "../dal/filter-condition";
import { RoleSeeder } from "../seeders/role-seeder";
import { ServerConfigSeeder } from "../seeders/server-config-seeder";
import {ApiServer, CookieManager, Seeder, SessionContextFactory} from "../types";
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
import { GraphQLRequest } from "apollo-server-types";
import cors from "cors";
import {ExpressCookieManager} from "./express-cookie-manager";

@injectable()
export class ExpressApiServer implements ApiServer {
	DEFAULT_PORT = 3000;

	mongodb_host = process.env.MONGODB_HOST || "mongodb";
	mongodb_db_name = process.env.MONGODB_DB_NAME || "rpgtools";

	needsSetup = false;

	httpServer: Server = null;
	expressServer: Express = null;
	gqlServer: ApolloServer = null;
	webSocketServer: WebSocketServer = null;

	@inject(INJECTABLE_TYPES.RoleRepository)
	roleRepository: MongodbRoleRepository;
	@inject(INJECTABLE_TYPES.UserRepository)
	userRepository: MongodbUserRepository;
	@inject(INJECTABLE_TYPES.ServerConfigRepository)
	serverConfigRepository: MongodbServerConfigRepository;

	@inject(INJECTABLE_TYPES.RoleSeeder)
	roleSeeder: RoleSeeder;
	@inject(INJECTABLE_TYPES.ServerConfigSeeder)
	serverConfigSeeder: ServerConfigSeeder;

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
		this.gqlServer = new ApolloServer({
			schema,
			context: ({req, res}) => {
				const cookieManager: CookieManager = new ExpressCookieManager(res);

				const refreshToken: string = req.cookies["refreshToken"];
				const accessToken: string = req.cookies["accessToken"];
				return this.sessionContextFactory.create(accessToken, refreshToken, cookieManager);
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

		this.expressServer.get("*", async (req, res, next) => {
			const needsSetup = await this.serverNeedsSetup();
			if (needsSetup) {
				if (
					[
						"/graphql",
						"/ui/setup",
						"/app.bundle.js",
						"/app.css",
						"/app.bundle.js.gz",
						"/app.css.gz",
						"favicon.ico",
					].includes(req.url)
				) {
					return next();
				}
				return res.redirect(302, "/ui/setup");
			} else {
				return next();
			}
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

	checkConfig = async (): Promise<boolean> => {
		let adminRole = await this.roleRepository.findOne([
			new FilterCondition("name", SERVER_ADMIN_ROLE),
		]);

		if (!adminRole) {
			this.needsSetup = true;
			return this.needsSetup;
		}

		const serverConfig = await this.serverConfigRepository.findOne([]);
		if (!serverConfig) {
			throw new Error("No server config exists! Did the seeders run correctly?");
		}

		this.needsSetup = serverConfig.adminUsers.length === 0;
		return this.needsSetup;
	};

	serverNeedsSetup = (): Promise<boolean> => {
		return this.checkConfig();
	};

	seedDB = async () => {
		const seeders: Seeder[] = [this.serverConfigSeeder, this.roleSeeder];

		for (let seeder of seeders) {
			await seeder.seed();
		}
	};

	initDb = async () => {
		return new Promise<void>((resolve, reject) => {
			mongoose
				.connect(`mongodb://${this.mongodb_host}/${this.mongodb_db_name}`)
				.then(async () => {
					console.log(
						`Connected to mongodb at mongodb://${this.mongodb_host}/${this.mongodb_db_name}`
					);
					await this.seedDB();
					resolve();
				})
				.catch(async (error) => {
					reject(error);
				});
		});
	};

	startListen = async () => {
		await this.checkConfig();

		const serverConfig = await this.serverConfigRepository.findOne([]);
		if (await this.serverNeedsSetup()) {
			console.warn(
				`Server needs configuration! Use unlock code ${serverConfig.unlockCode} to unlock`
			);
		}
		const port = process.env.SERVER_PORT || this.DEFAULT_PORT;
		this.httpServer.listen(port, () => {
			console.log(`The server is running and listening at http://localhost:${port}`);
		});
	};

	start = async () => {
		await this.applyMiddleware();
		await this.initDb();
		await this.startListen();
	};

	setDbHost(host: string): void {
		this.mongodb_host = host;
	}

	setDbName(name: string): void {
		this.mongodb_db_name = name;
	}

	async clearDb(): Promise<void> {
		const collections = await mongoose.connection.db.listCollections().toArray();
		for (let collection of collections) {
			try {
				await mongoose.connection.db.dropCollection(collection.name);
			} catch (e) {
				console.log(`error while clearing collections: ${e.message}`);
			}
		}
	}
}
