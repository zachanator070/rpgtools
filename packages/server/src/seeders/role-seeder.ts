import { PermissionAssignmentFactory, RoleFactory, Seeder } from "../types";
import {EVERYONE, LOGGED_IN} from "@rpgtools/common/src/role-constants";
import { WORLD_CREATE } from "@rpgtools/common/src/permission-constants";
import { SERVER_CONFIG } from "@rpgtools/common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import { MongodbUserRepository } from "../dal/mongodb/repositories/mongodb-user-repository";
import { FilterCondition } from "../dal/filter-condition";
import { MongodbServerConfigRepository } from "../dal/mongodb/repositories/mongodb-server-config-repository";
import { MongodbRoleRepository } from "../dal/mongodb/repositories/mongodb-role-repository";
import { MongodbPermissionAssignmentRepository } from "../dal/mongodb/repositories/mongodb-permission-assignment-repository";
import { Role } from "../domain-entities/role";

@injectable()
export class RoleSeeder implements Seeder {
	@inject(INJECTABLE_TYPES.UserRepository)
	userRepository: MongodbUserRepository;

	@inject(INJECTABLE_TYPES.ServerConfigRepository)
	serverConfigRepository: MongodbServerConfigRepository;

	@inject(INJECTABLE_TYPES.RoleRepository)
	roleRepository: MongodbRoleRepository;

	@inject(INJECTABLE_TYPES.PermissionAssignmentRepository)
	permissionAssignmentRepository: MongodbPermissionAssignmentRepository;
	@inject(INJECTABLE_TYPES.PermissionAssignmentFactory)
	permissionAssignmentFactory: PermissionAssignmentFactory;
	@inject(INJECTABLE_TYPES.RoleFactory)
	roleFactory: RoleFactory;

	seed = async (): Promise<void> => {
		let allUsersRole: Role = await this.roleRepository.findOne([
			new FilterCondition("name", EVERYONE),
		]);
		if (!allUsersRole) {
			const server = await this.serverConfigRepository.findOne([]);
			if (!server) {
				throw new Error("Server needs to exist!");
			}
			allUsersRole = this.roleFactory({_id: null, name: EVERYONE, world: null, permissions: []});
			await this.roleRepository.create(allUsersRole);
			console.log(`Created default role "${EVERYONE}"`);
		}
		let loggedInRole: Role = await this.roleRepository.findOne([
			new FilterCondition("name", LOGGED_IN),
		]);
		if (!loggedInRole) {
			const server = await this.serverConfigRepository.findOne([]);
			if (!server) {
				throw new Error("Server needs to exist!");
			}
			loggedInRole = this.roleFactory({_id: null, name: LOGGED_IN, world: null, permissions: []});
			await this.roleRepository.create(loggedInRole);
			let createWorldPermission = await this.permissionAssignmentRepository.findOne([
				new FilterCondition("permission", WORLD_CREATE),
				new FilterCondition("subject", server._id),
				new FilterCondition("subjectType", SERVER_CONFIG),
			]);
			if (!createWorldPermission) {
				createWorldPermission = this.permissionAssignmentFactory(
					{
						_id: null,
						permission: WORLD_CREATE,
						subject: server._id,
						subjectType: SERVER_CONFIG
					}
				);
				await this.permissionAssignmentRepository.create(createWorldPermission);
			}
			loggedInRole.permissions.push(createWorldPermission._id);
			await this.roleRepository.update(loggedInRole);
			console.log(`Created default role "${LOGGED_IN}"`);
		}
	};
}
