import { Role } from "../domain-entities/role";
import {inject, injectable} from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import { Factory, RoleRepository, RoleService, WorldRepository } from "../types";
import { SecurityContext } from "../security/security-context";
import { FILTER_CONDITION_REGEX, FilterCondition } from "../dal/filter-condition";
import { RoleAuthorizationRuleset } from "../security/ruleset/role-authorization-ruleset";
import { PaginatedResult } from "../dal/paginated-result";
import { DbUnitOfWork } from "../dal/db-unit-of-work";

@injectable()
export class RoleApplicationService implements RoleService {
	@inject(INJECTABLE_TYPES.WorldRepository)
	worldRepository: WorldRepository;
	@inject(INJECTABLE_TYPES.RoleRepository)
	roleRepository: RoleRepository;

	@inject(INJECTABLE_TYPES.RoleAuthorizationRuleset)
	roleAuthorizationRuleset: RoleAuthorizationRuleset;

	@inject(INJECTABLE_TYPES.DbUnitOfWorkFactory)
	dbUnitOfWorkFactory: Factory<DbUnitOfWork>;

	getRoles = async (
		context: SecurityContext,
		worldId: string,
		name: string,
		canAdmin: boolean,
		page: number
	): Promise<PaginatedResult<Role>> => {
		const world = await this.worldRepository.findById(worldId);
		if (!world) {
			throw new Error("World does not exist");
		}
		if (!(await world.authorizationRuleset.canRead(context, world))) {
			throw new Error("You do not have permission to read this World");
		}

		const conditions: FilterCondition[] = [new FilterCondition("world", worldId)];
		if (name) {
			conditions.push(new FilterCondition("name", name, FILTER_CONDITION_REGEX));
		}

		const results = await this.roleRepository.findPaginated(conditions, page);

		const docs = [];
		for (let doc of results.docs) {
			if (canAdmin !== undefined && !(await this.roleAuthorizationRuleset.canAdmin(context, doc))) {
				continue;
			}
			if (await this.roleAuthorizationRuleset.canRead(context, doc)) {
				docs.push(doc);
			}
		}
		results.docs = docs;
		return results;
	};
}
