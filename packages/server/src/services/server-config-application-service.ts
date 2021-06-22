import { SERVER_ADMIN_ROLE, SERVER_PERMISSIONS } from "../../../common/src/permission-constants";
import { SERVER_CONFIG } from "../../../common/src/type-constants";
import { DbUnitOfWork } from "../dal/db-unit-of-work";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../injectable-types";
import {
	ApiServer,
	AuthenticationService,
	ServerConfigRepository,
	ServerConfigService,
} from "../types";
import { Role } from "../domain-entities/role";
import { PermissionAssignment } from "../domain-entities/permission-assignment";
import { v4 as uuidv4 } from "uuid";
import { ServerConfigAuthorizationRuleset } from "../security/server-config-authorization-ruleset";
import { SecurityContext } from "../security-context";

@injectable()
export class ServerConfigApplicationService implements ServerConfigService {
	@inject(INJECTABLE_TYPES.AuthenticationService)
	authenticationService: AuthenticationService;

	@inject(INJECTABLE_TYPES.ApiServer)
	server: ApiServer;

	serverConfigAuthorizationRuleset: ServerConfigAuthorizationRuleset = new ServerConfigAuthorizationRuleset();

	@inject(INJECTABLE_TYPES.ServerConfigRepository)
	serverConfigRepository: ServerConfigRepository;

	unlockServer = async (unlockCode: string, email: string, username: string, password: string) => {
		const unitOfWork = new DbUnitOfWork();
		const server = await unitOfWork.serverConfigRepository.findOne([]);
		if (!server) {
			throw new Error("Server config doesnt exist!");
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
		const adminRole = new Role("", SERVER_ADMIN_ROLE, "", []);
		for (let permission of SERVER_PERMISSIONS) {
			const permissionAssignment = new PermissionAssignment(
				"",
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
		await unitOfWork.serverConfigRepository.update(server);
		await this.server.checkConfig();
		await unitOfWork.commit();
		return true;
	};

	generateRegisterCodes = async (context: SecurityContext, amount: number) => {
		const unitOfWork = new DbUnitOfWork();
		const server = await unitOfWork.serverConfigRepository.findOne([]);
		if (!server) {
			throw new Error("Server config doesnt exist!");
		}
		if (!(await this.serverConfigAuthorizationRuleset.canWrite(context, server))) {
			throw new Error("You do not have permission to call this method");
		}
		const newCodes = Array(amount)
			.fill("")
			.map(() => uuidv4());
		server.registerCodes = server.registerCodes.concat(newCodes);
		await unitOfWork.serverConfigRepository.update(server);
		await unitOfWork.commit();
		return server;
	};

	getServerConfig = async () => {
		return this.serverConfigRepository.findOne([]);
	};
}
