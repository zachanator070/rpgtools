import { Seeder } from "../types.js";
import {EVERYONE, LOGGED_IN} from "@rpgtools/common/src/role-constants.js";
import { WORLD_CREATE } from "@rpgtools/common/src/permission-constants.js";
import {ROLE} from "@rpgtools/common/src/type-constants.js";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types.js";
import { Role } from "../domain-entities/role.js";
import RoleFactory from "../domain-entities/factory/role-factory.js";
import {DatabaseContext} from "../dal/database-context.js";
import Logger from "../logging/logger.js";

@injectable()
export class RoleSeeder implements Seeder {

	@inject(INJECTABLE_TYPES.RoleFactory)
	roleFactory: RoleFactory;

	@inject(INJECTABLE_TYPES.Logger)
	logger: Logger;

	seed = async (databaseContext: DatabaseContext): Promise<void> => {
		let allUsersRole: Role = await databaseContext.roleRepository.findOneByName(EVERYONE);
		if (!allUsersRole) {
			const server = await databaseContext.serverConfigRepository.findOne();
			if (!server) {
				throw new Error("Server needs to exist!");
			}
			allUsersRole = this.roleFactory.build({name: EVERYONE, world: null, acl: []});
			await databaseContext.roleRepository.create(allUsersRole);
			this.logger.info(`Created default role "${EVERYONE}"`);
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
			this.logger.info(`Created default role "${LOGGED_IN}"`);
		}
	};
}
