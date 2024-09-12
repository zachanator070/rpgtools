import { Seeder } from "../types";
import {EVERYONE, LOGGED_IN} from "@rpgtools/common/src/role-constants";
import { WORLD_CREATE } from "@rpgtools/common/src/permission-constants";
import {ROLE} from "@rpgtools/common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types.js";
import { Role } from "../domain-entities/role.js";
import RoleFactory from "../domain-entities/factory/role-factory.js";
import {RoleRepository} from "../dal/repository/role-repository.js";
import {ServerConfigRepository} from "../dal/repository/server-config-repository.js";
import {UserRepository} from "../dal/repository/user-repository.js";
import {DatabaseContext} from "../dal/database-context.js";

@injectable()
export class RoleSeeder implements Seeder {

	@inject(INJECTABLE_TYPES.RoleFactory)
	roleFactory: RoleFactory;

	seed = async (databaseContext: DatabaseContext): Promise<void> => {
		let allUsersRole: Role = await databaseContext.roleRepository.findOneByName(EVERYONE);
		if (!allUsersRole) {
			const server = await databaseContext.serverConfigRepository.findOne();
			if (!server) {
				throw new Error("Server needs to exist!");
			}
			allUsersRole = this.roleFactory.build({name: EVERYONE, world: null, acl: []});
			await databaseContext.roleRepository.create(allUsersRole);
			console.log(`Created default role "${EVERYONE}"`);
		}
		let loggedInRole: Role = await databaseContext.roleRepository.findOneByName(LOGGED_IN);
		if (!loggedInRole) {
			const server = await databaseContext.serverConfigRepository.findOne();
			if (!server) {
				throw new Error("Server needs to exist!");
			}
			loggedInRole = this.roleFactory.build({name: LOGGED_IN, world: null, acl: []});
			await databaseContext.roleRepository.create(loggedInRole);
			server.acl.push({
				permission: WORLD_CREATE,
				principal: loggedInRole._id,
				principalType: ROLE
			});
			await databaseContext.serverConfigRepository.update(server);
			console.log(`Created default role "${LOGGED_IN}"`);
		}
	};
}
