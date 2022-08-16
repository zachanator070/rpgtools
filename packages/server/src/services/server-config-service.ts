import { SERVER_ADMIN_ROLE, SERVER_PERMISSIONS } from "@rpgtools/common/src/permission-constants";
import { SERVER_CONFIG } from "@rpgtools/common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import {
	ApiServer,
	PermissionAssignmentFactory,
	RoleFactory,
	UnitOfWork,
} from "../types";
import { v4 as uuidv4 } from "uuid";
import { SecurityContext } from "../security/security-context";
import {FilterCondition} from "../dal/filter-condition";
import {AuthenticationService} from "./authentication-service";

@injectable()
export class ServerConfigService {
	@inject(INJECTABLE_TYPES.AuthenticationService)
	authenticationService: AuthenticationService;

	@inject(INJECTABLE_TYPES.ApiServer)
	server: ApiServer;

	@inject(INJECTABLE_TYPES.PermissionAssignmentFactory)
	permissionAssignmentFactory: PermissionAssignmentFactory;

	@inject(INJECTABLE_TYPES.RoleFactory)
	roleFactory: RoleFactory;

	unlockServer = async (unlockCode: string, email: string, username: string, password: string, unitOfWork: UnitOfWork) => {
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
		const adminRole = this.roleFactory({_id: null, name: SERVER_ADMIN_ROLE, world: null, permissions: []});
		for (let permission of SERVER_PERMISSIONS) {
			let permissionAssignment = await unitOfWork.permissionAssignmentRepository.findOne([
				new FilterCondition('permission', permission),
				new FilterCondition('subject', server._id),
				new FilterCondition('subjectType', SERVER_CONFIG),
			]);
			if (!permissionAssignment) {
				permissionAssignment = this.permissionAssignmentFactory(
					{
						_id: null,
						permission,
						subject: server._id,
						subjectType: SERVER_CONFIG
					}
				);
				await unitOfWork.permissionAssignmentRepository.create(permissionAssignment);
			}

			adminRole.permissions.push(permissionAssignment._id);
		}
		await unitOfWork.roleRepository.create(adminRole);
		admin.roles.push(adminRole._id);
		await unitOfWork.userRepository.update(admin);
		server.adminUsers.push(admin._id);
		await unitOfWork.serverConfigRepository.update(server);
		await this.server.checkConfig();
		return true;
	};

	generateRegisterCodes = async (context: SecurityContext, amount: number, unitOfWork: UnitOfWork) => {
		const serverConfig = await unitOfWork.serverConfigRepository.findOne([]);
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
		await unitOfWork.serverConfigRepository.update(serverConfig);
		return serverConfig;
	};

	getServerConfig = async (unitOfWork: UnitOfWork) => {
		return unitOfWork.serverConfigRepository.findOne([]);
	};
}