import { Seeder } from "../types";
import { ALL_USERS } from "../../../common/src/role-constants";
import { WORLD_CREATE } from "../../../common/src/permission-constants";
import { SERVER_CONFIG } from "../../../common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../injectable-types";
import { MongodbUserRepository } from "../dal/mongodb/repositories/mongodb-user-repository";
import { FilterCondition } from "../dal/filter-condition";
import { MongodbServerConfigRepository } from "../dal/mongodb/repositories/mongodb-server-config-repository";
import { MongodbRoleRepository } from "../dal/mongodb/repositories/mongodb-role-repository";
import { MongodbPermissionAssignmentRepository } from "../dal/mongodb/repositories/mongodb-permission-assignment-repository";
import { Role } from "../domain-entities/role";
import { PermissionAssignment } from "../domain-entities/permission-assignment";

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

	seed = async (): Promise<void> => {
		let allUsersRole: Role = await this.roleRepository.findOne([
			new FilterCondition("name", ALL_USERS),
		]);
		if (!allUsersRole) {
			const server = await this.serverConfigRepository.findOne([]);
			if (!server) {
				throw new Error("Server needs to exist!");
			}
			allUsersRole = new Role("", ALL_USERS, null, []);
			await this.roleRepository.create(allUsersRole);
			let createWorldPermission = await this.permissionAssignmentRepository.findOne([
				new FilterCondition("permission", WORLD_CREATE),
				new FilterCondition("subject", server._id),
				new FilterCondition("subjectType", SERVER_CONFIG),
			]);
			if (!createWorldPermission) {
				createWorldPermission = new PermissionAssignment(
					"",
					WORLD_CREATE,
					server._id,
					SERVER_CONFIG
				);
				await this.permissionAssignmentRepository.create(createWorldPermission);
			}
			allUsersRole.permissions.push(createWorldPermission._id);
			await this.roleRepository.update(allUsersRole);
			console.log(`Created default role "${ALL_USERS}"`);
		}
	};
}
