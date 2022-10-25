import { Seeder } from "../types";
import {EVERYONE, LOGGED_IN} from "@rpgtools/common/src/role-constants";
import { WORLD_CREATE } from "@rpgtools/common/src/permission-constants";
import {ROLE} from "@rpgtools/common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import { Role } from "../domain-entities/role";
import RoleFactory from "../domain-entities/factory/role-factory";
import {RoleRepository} from "../dal/repository/role-repository";
import {ServerConfigRepository} from "../dal/repository/server-config-repository";
import {UserRepository} from "../dal/repository/user-repository";

@injectable()
export class RoleSeeder implements Seeder {
	@inject(INJECTABLE_TYPES.UserRepository)
	userRepository: UserRepository;

	@inject(INJECTABLE_TYPES.ServerConfigRepository)
	serverConfigRepository: ServerConfigRepository;

	@inject(INJECTABLE_TYPES.RoleRepository)
	roleRepository: RoleRepository;

	@inject(INJECTABLE_TYPES.RoleFactory)
	roleFactory: RoleFactory;

	seed = async (): Promise<void> => {
		let allUsersRole: Role = await this.roleRepository.findOneByName(EVERYONE);
		if (!allUsersRole) {
			const server = await this.serverConfigRepository.findOne();
			if (!server) {
				throw new Error("Server needs to exist!");
			}
			allUsersRole = this.roleFactory.build({name: EVERYONE, world: null, acl: []});
			await this.roleRepository.create(allUsersRole);
			console.log(`Created default role "${EVERYONE}"`);
		}
		let loggedInRole: Role = await this.roleRepository.findOneByName(LOGGED_IN);
		if (!loggedInRole) {
			const server = await this.serverConfigRepository.findOne();
			if (!server) {
				throw new Error("Server needs to exist!");
			}
			loggedInRole = this.roleFactory.build({name: LOGGED_IN, world: null, acl: []});
			await this.roleRepository.create(loggedInRole);
			server.acl.push({
				permission: WORLD_CREATE,
				principal: loggedInRole._id,
				principalType: ROLE
			});
			await this.roleRepository.update(loggedInRole);
			console.log(`Created default role "${LOGGED_IN}"`);
		}
	};
}
