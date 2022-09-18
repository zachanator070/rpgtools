import { User } from "../domain-entities/user";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import { Role } from "../domain-entities/role";
import { SecurityContext } from "./security-context";
import {ANON_USERNAME} from "@rpgtools/common/src/permission-constants";
import {EVERYONE, LOGGED_IN} from "@rpgtools/common/src/role-constants";
import {RoleRepository} from "../dal/repository/role-repository";

@injectable()
export class SecurityContextFactory {

	@inject(INJECTABLE_TYPES.RoleRepository)
	roleRepository: RoleRepository;

	getRoles = async (user: User): Promise<Role[]> => {
		const roles: Role[] = [];
		for (let roleId of user.roles) {
			roles.push(await this.roleRepository.findOneById(roleId));
		}
		if (user.username !== ANON_USERNAME) {
			roles.push(await this.roleRepository.findOneByName(LOGGED_IN));
		}
		roles.push(await this.roleRepository.findOneByName(EVERYONE));
		return roles;
	};

	create = async (user: User): Promise<SecurityContext> => {
		const roles = await this.getRoles(user);
		return new SecurityContext(user, roles);
	};
}
