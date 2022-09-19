import { SERVER_ADMIN_ROLE, SERVER_PERMISSIONS } from "@rpgtools/common/src/permission-constants";
import {ROLE} from "@rpgtools/common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import {
	ApiServer,
	RoleFactory,
} from "../types";
import { v4 as uuidv4 } from "uuid";
import { SecurityContext } from "../security/security-context";
import {AuthenticationService} from "./authentication-service";
import {DatabaseContext} from "../dal/database-context";

@injectable()
export class ServerConfigService {
	@inject(INJECTABLE_TYPES.AuthenticationService)
	authenticationService: AuthenticationService;

	@inject(INJECTABLE_TYPES.ApiServer)
	server: ApiServer;

	@inject(INJECTABLE_TYPES.RoleFactory)
	roleFactory: RoleFactory;

	serverNeedsSetup = async (databaseContext: DatabaseContext): Promise<boolean> => {
		let adminRole = await databaseContext.roleRepository.findOneByName(SERVER_ADMIN_ROLE);

		if (!adminRole) {
			return true;
		}

		const serverConfig = await databaseContext.serverConfigRepository.findOne();
		if (!serverConfig) {
			throw new Error("No server config exists! Did the seeders run correctly?");
		}

		return serverConfig.adminUsers.length === 0;
	};

	unlockServer = async (unlockCode: string, email: string, username: string, password: string, databaseContext: DatabaseContext) => {
		const server = await databaseContext.serverConfigRepository.findOne();
		if (!server) {
			throw new Error("Server config doesnt exist!");
		}
		if (!await this.serverNeedsSetup(databaseContext)) {
			throw new Error("Server already unlocked!");
		}
		if (server.unlockCode !== unlockCode) {
			throw new Error("Unlock code is incorrect");
		}
		if (server.adminUsers.length > 0) {
			throw new Error("Server is already unlocked");
		}
		const admin = await this.authenticationService.registerUser(
			email,
			username,
			password,
			databaseContext
		);
		const adminRole = this.roleFactory({_id: null, name: SERVER_ADMIN_ROLE, world: null, acl: []});
		await databaseContext.roleRepository.create(adminRole);
		for (let permission of SERVER_PERMISSIONS) {

			server.acl.push({
				permission,
				principal: adminRole._id,
				principalType: ROLE
			});
		}
		admin.roles.push(adminRole._id);
		await databaseContext.userRepository.update(admin);
		server.adminUsers.push(admin._id);
		await databaseContext.serverConfigRepository.update(server);
		return true;
	};

	generateRegisterCodes = async (context: SecurityContext, amount: number, databaseContext: DatabaseContext) => {
		const serverConfig = await databaseContext.serverConfigRepository.findOne();
		if (!serverConfig) {
			throw new Error("Server config doesnt exist!");
		}
		if (!(await serverConfig.authorizationPolicy.canWrite(context))) {
			throw new Error("You do not have permission to call this method");
		}
		const newCodes = Array(amount)
			.fill("")
			.map(() => uuidv4());
		serverConfig.registerCodes = serverConfig.registerCodes.concat(newCodes);
		await databaseContext.serverConfigRepository.update(serverConfig);
		return serverConfig;
	};

	getServerConfig = async (databaseContext: DatabaseContext) => {
		return databaseContext.serverConfigRepository.findOne();
	};
}
