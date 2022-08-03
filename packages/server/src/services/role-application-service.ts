import { Role } from "../domain-entities/role";
import {inject, injectable} from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import { Factory, RoleRepository, RoleService, WorldRepository } from "../types";
import { SecurityContext } from "../security/security-context";
import { FILTER_CONDITION_REGEX, FilterCondition } from "../dal/filter-condition";
import { PaginatedResult } from "../dal/paginated-result";
import { DbUnitOfWork } from "../dal/db-unit-of-work";

@injectable()
export class RoleApplicationService implements RoleService {
	@inject(INJECTABLE_TYPES.WorldRepository)
	worldRepository: WorldRepository;
	@inject(INJECTABLE_TYPES.RoleRepository)
	roleRepository: RoleRepository;

	@inject(INJECTABLE_TYPES.DbUnitOfWorkFactory)
	dbUnitOfWorkFactory: Factory<DbUnitOfWork>;

	getRoles = async (
		context: SecurityContext,
		worldId: string,
		name: string,
		canAdmin: boolean,
		page: number
	): Promise<PaginatedResult<Role>> => {

		const conditions: FilterCondition[] = [];

		if (worldId) {
			const world = await this.worldRepository.findById(worldId);
			if (!world) {
				throw new Error("World does not exist");
			}
			if (!(await world.authorizationPolicy.canRead(context))) {
				throw new Error("You do not have permission to read this World");
			}
			conditions.push(new FilterCondition("world", worldId));
		}

		if (name) {
			conditions.push(new FilterCondition("name", name, FILTER_CONDITION_REGEX));
		}

		const results = await this.roleRepository.findPaginated(conditions, page);

		const roles = [];
		for (let role of results.docs) {
			if (canAdmin !== undefined && !(await role.authorizationPolicy.canAdmin(context))) {
				continue;
			}
			if (await role.authorizationPolicy.canRead(context)) {
				roles.push(role);
			}
		}
		results.docs = roles;
		return results;
	};
}
