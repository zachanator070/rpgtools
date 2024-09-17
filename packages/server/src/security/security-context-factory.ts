import { User } from "../domain-entities/user.js";
import { injectable } from "inversify";
import { Role } from "../domain-entities/role.js";
import { SecurityContext } from "./security-context.js";
import {ANON_USERNAME} from "@rpgtools/common/src/permission-constants.js";
import {EVERYONE, LOGGED_IN} from "@rpgtools/common/src/role-constants.js";
import {DatabaseContext} from "../dal/database-context.js";

@injectable()
export class SecurityContextFactory {

	getRoles = async (user: User, databaseContext: DatabaseContext): Promise<Role[]> => {
		const roles: Role[] = [];
		for (const roleId of user.roles) {
			roles.push(await databaseContext.roleRepository.findOneById(roleId));
		}
		if (user.username !== ANON_USERNAME) {
			roles.push(await databaseContext.roleRepository.findOneByName(LOGGED_IN));
		}
		roles.push(await databaseContext.roleRepository.findOneByName(EVERYONE));
		return roles;
	};

	create = async (user: User, databaseContext: DatabaseContext): Promise<SecurityContext> => {
		const roles = await this.getRoles(user, databaseContext);
		return new SecurityContext(user, roles);
	};
}
