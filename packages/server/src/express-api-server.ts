import bodyParser from "body-parser";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import { SERVER_ADMIN_ROLE } from "../../common/src/permission-constants";
import http, { Server } from "http";
import { ApolloServer } from "apollo-server-express";
import express, { Express } from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import { MongodbRoleRepository } from "./dal/mongodb/repositories/mongodb-role-repository";
import { INJECTABLE_TYPES } from "./injectable-types";
import { inject, injectable } from "inversify";
import { MongodbUserRepository } from "./dal/mongodb/repositories/mongodb-user-repository";
import { MongodbServerConfigRepository } from "./dal/mongodb/repositories/mongodb-server-config-repository";
import { FilterCondition } from "./dal/filter-condition";
import { RoleSeeder } from "./seeders/role-seeder";
import { ServerConfigSeeder } from "./seeders/server-config-seeder";
import { ApiServer, Seeder, SessionContextFactory } from "./types";
import { GraphqlConnectionContextFactory } from "./graphql-connection-context-factory";
import { graphqlUploadExpress } from "graphql-upload";
import { ModelRouter } from "./routers/model-router";
import ExportRouter from "./routers/export-router";
import { ImageRouter } from "./routers/image-router";
import { typeDefs } from "./gql-server-schema";
import { allResolvers } from "./resolvers/all-resolvers";
import {DocumentNode, execute, subscribe} from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import {GraphQLRequest} from "apollo-server-types";

@injectable()
export class ExpressApiServer implements ApiServer {
	DEFAULT_PORT = 3000;

	mongodb_host = process.env.MONGODB_HOST || "mongodb";
	mongodb_db_name = process.env.MONGODB_DB_NAME || "rpgtools";

	needsSetup = false;

	httpServer: Server = null;
	expressServer: Express = null;
	gqlServer: ApolloServer = null;
	subscriptionServer: SubscriptionServer = null;

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

	connectionContextFactory: GraphqlConnectionContextFactory = new GraphqlConnectionContextFactory();

	constructor(
		@inject(INJECTABLE_TYPES.SessionContextFactory) sessionContextFactory: SessionContextFactory
	) {
		const schema = makeExecutableSchema({ typeDefs, resolvers: allResolvers });
		this.gqlServer = new ApolloServer({
			schema,
			context: sessionContextFactory.create,
		});
		this.expressServer = express();
		this.httpServer = http.createServer(this.expressServer);
		this.subscriptionServer = SubscriptionServer.create({
			schema,
			execute,
			subscribe,
		}, {
			// This is the `httpServer` we created in a previous step.
			server: this.httpServer,
			// This `server` is the instance returned from `new ApolloServer`.
			path: this.gqlServer.graphqlPath,
		});

		// Shut down in the case of interrupt and termination signals
		// We expect to handle this more cleanly in the future. See (#5074)[https://github.com/apollographql/apollo-server/issues/5074] for reference.
		['SIGINT', 'SIGTERM'].forEach(signal => {
			process.on(signal, () => this.subscriptionServer.close());
		});

		this.expressServer.use(bodyParser.json());
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

		this.expressServer.get("*", (req, res, next) => {
			const needsSetup = this.serverNeedsSetup();
			if (needsSetup) {
				if (
					[
						"/api",
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

		this.expressServer.get("/ui*", (req, res) => {
			return res.sendFile(path.resolve(__dirname, "../dist", "index.html"));
		});

		this.expressServer.use(express.static("dist"));
		this.expressServer.use(express.static("src/static-assets"));
		this.expressServer.use(graphqlUploadExpress());

	}

	executeGraphQLQuery = async (request: Omit<GraphQLRequest, 'query'> & {
		query?: string | DocumentNode;
	},) => this.gqlServer.executeOperation(request);

	applyMiddleware = async () => {
		await this.gqlServer.start();
		this.gqlServer.applyMiddleware({ app: this.expressServer, path: "/api" });
	}

	checkConfig = async () => {
		let adminRole = await this.roleRepository.findOne([
			new FilterCondition("name", SERVER_ADMIN_ROLE),
		]);

		if (!adminRole) {
			this.needsSetup = true;
			return;
		}

		const serverConfig = await this.serverConfigRepository.findOne([]);
		if (!serverConfig) {
			throw new Error("No server config exists! Did the seeders run correctly?");
		}

		this.needsSetup = serverConfig.adminUsers.length === 0;
	};

	serverNeedsSetup = () => {
		return this.needsSetup;
	};

	seedDB = async () => {
		const seeders: Seeder[] = [this.serverConfigSeeder, this.roleSeeder];

		for (let seeder of seeders) {
			await seeder.seed();
		}
	};

	initDb = async () => {
		mongoose.set("useNewUrlParser", true);
		mongoose.set("useFindAndModify", false);
		mongoose.set("useCreateIndex", true);
		mongoose.set("useUnifiedTopology", true);

		return new Promise<void>((resolve, reject) => {
			mongoose
				.connect(`mongodb://${this.mongodb_host}/${this.mongodb_db_name}`, {
					useNewUrlParser: true,
				})
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

		if (!process.env.ACCESS_TOKEN_SECRET) {
			console.warn(
				"environment variable ACCESS_TOKEN_SECRET is not set, restarting server will log out all users"
			);
			process.env.ACCESS_TOKEN_SECRET = crypto.randomBytes(2048).toString();
		}

		if (!process.env.REFRESH_TOKEN_SECRET) {
			console.log(
				"environment variable REFRESH_TOKEN_SECRET is not set, restarting server will log out all users"
			);
			process.env.REFRESH_TOKEN_SECRET = crypto.randomBytes(2048).toString();
		}

		const serverConfig = await this.serverConfigRepository.findOne([]);
		if (this.serverNeedsSetup()) {
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
