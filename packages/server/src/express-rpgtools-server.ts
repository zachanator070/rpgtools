import { SERVER_ADMIN_ROLE } from "../../common/src/permission-constants";
import { Server } from "http";
import { ApolloServer } from "apollo-server-express";
import { Express } from "express";
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
import { Seeder } from "./types";

export interface RPGToolsServer {
	start(): Promise<void>;
	checkConfig(): Promise<void>;
}

@injectable()
export class ExpressRPGToolsServer implements RPGToolsServer {
	DEFAULT_PORT = 3000;

	mongodb_host = process.env.MONGODB_HOST || "mongodb";
	mongodb_db_name = process.env.MONGODB_DB_NAME || "rpgtools";

	needsSetup = false;

	httpServer: Server = null;
	expressServer: Express = null;
	gqlServer: ApolloServer = null;

	@inject(INJECTABLE_TYPES.RoleRepository)
	roleRepository: MongodbRoleRepository;
	@inject(INJECTABLE_TYPES.UserRepository)
	userRepository: MongodbUserRepository;
	@inject(INJECTABLE_TYPES.ServerConfigRepository)
	serverConfigRepository: MongodbServerConfigRepository;

	constructor(httpServer: Server, expressServer: Express, gqlServer: ApolloServer) {
		this.httpServer = httpServer;
		this.expressServer = expressServer;
		this.gqlServer = gqlServer;
	}

	checkConfig = async () => {
		let adminRole = await this.roleRepository.findOne([
			new FilterCondition("name", SERVER_ADMIN_ROLE),
		]);

		if (!adminRole) {
			this.needsSetup = true;
			return;
		}
		const users = await this.userRepository.find([new FilterCondition("roles", adminRole._id)]);

		this.needsSetup = users.length === 0;
	};

	serverNeedsSetup = () => {
		return this.needsSetup;
	};

	seedDB = async () => {
		const seeders: Seeder[] = [new RoleSeeder(), new ServerConfigSeeder()];

		for (let seeder of seeders) {
			await seeder.seed();
		}
	};

	connectToDB = async () => {
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
		await this.connectToDB();
		await this.startListen();
	};
}
