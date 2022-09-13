import { User } from "../domain-entities/user";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import { Repository } from "../types";
import { FilterCondition } from "../dal/filter-condition";
import { Role } from "../domain-entities/role";
import { SecurityContext } from "./security-context";

@injectable()
export class SecurityContextFactory {

	@inject(INJECTABLE_TYPES.RoleRepository)
	roleRepository: Repository<Role>;

	getRoles = async (user: User): Promise<Role[]> => {
		const roles: Role[] = [];
		for (let roleId of user.roles) {
			roles.push(await this.roleRepository.findOne([new FilterCondition("_id", roleId)]));
		}
		return roles;
	};

	create = async (user: User): Promise<SecurityContext> => {
		const roles = await this.getRoles(user);
		return new SecurityContext(user, roles);
	};
}
