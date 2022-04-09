import { SERVER_ADMIN_ROLE, SERVER_PERMISSIONS } from "../../../common/src/permission-constants";
import { SERVER_CONFIG } from "../../../common/src/type-constants";
import { DbUnitOfWork } from "../dal/db-unit-of-work";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import {
	ApiServer,
	AuthenticationService,
	Factory,
	PermissionAssignmentFactory,
	RoleFactory,
	ServerConfigRepository,
	ServerConfigService,
} from "../types";
import { v4 as uuidv4 } from "uuid";
import { ServerConfigAuthorizationRuleset } from "../security/ruleset/server-config-authorization-ruleset";
import { SecurityContext } from "../security/security-context";

@injectable()
export class ServerConfigApplicationService implements ServerConfigService {
	@inject(INJECTABLE_TYPES.AuthenticationService)
	authenticationService: AuthenticationService;

	@inject(INJECTABLE_TYPES.ApiServer)
	server: ApiServer;

	@inject(INJECTABLE_TYPES.ServerConfigAuthorizationRuleset)
	serverConfigAuthorizationRuleset: ServerConfigAuthorizationRuleset;

	@inject(INJECTABLE_TYPES.ServerConfigRepository)
	serverConfigRepository: ServerConfigRepository;

	@inject(INJECTABLE_TYPES.DbUnitOfWorkFactory)
	dbUnitOfWorkFactory: Factory<DbUnitOfWork>;

	@inject(INJECTABLE_TYPES.PermissionAssignmentFactory)
	permissionAssignmentFactory: PermissionAssignmentFactory;

	@inject(INJECTABLE_TYPES.RoleFactory)
	roleFactory: RoleFactory;

	unlockServer = async (unlockCode: string, email: string, username: string, password: string) => {
		const unitOfWork = this.dbUnitOfWorkFactory();
		const server = await unitOfWork.serverConfigRepository.findOne([]);
		if (!server) {
			throw new Error("Server config doesnt exist!");
		}
		if (!await this.server.serverNeedsSetup()) {
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
			unitOfWork
		);
		const adminRole = this.roleFactory(null, SERVER_ADMIN_ROLE, null, []);
		for (let permission of SERVER_PERMISSIONS) {
			const permissionAssignment = this.permissionAssignmentFactory(
				null,
				permission,
				server._id,
				SERVER_CONFIG
			);
			await unitOfWork.permissionAssignmentRepository.create(permissionAssignment);
			adminRole.permissions.push(permissionAssignment._id);
		}
		await unitOfWork.roleRepository.create(adminRole);
		admin.roles.push(adminRole._id);
		await unitOfWork.userRepository.update(admin);
		server.adminUsers.push(admin._id);
		await unitOfWork.serverConfigRepository.update(server);
		await this.server.checkConfig();
		await unitOfWork.commit();
		return true;
	};

	generateRegisterCodes = async (context: SecurityContext, amount: number) => {
		const unitOfWork = this.dbUnitOfWorkFactory();
		const serverConfig = await unitOfWork.serverConfigRepository.findOne([]);
		if (!serverConfig) {
			throw new Error("Server config doesnt exist!");
		}
		if (!(await this.serverConfigAuthorizationRuleset.canWrite(context, serverConfig))) {
			throw new Error("You do not have permission to call this method");
		}
		const newCodes = Array(amount)
			.fill("")
			.map(() => uuidv4());
		serverConfig.registerCodes = serverConfig.registerCodes.concat(newCodes);
		await unitOfWork.serverConfigRepository.update(serverConfig);
		await unitOfWork.commit();
		return serverConfig;
	};

	getServerConfig = async () => {
		return this.serverConfigRepository.findOne([]);
	};
}
