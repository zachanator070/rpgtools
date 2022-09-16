import { Role } from "../domain-entities/role";
import {injectable} from "inversify";
import { SecurityContext } from "../security/security-context";
import { FILTER_CONDITION_REGEX, FilterCondition } from "../dal/filter-condition";
import { PaginatedResult } from "../dal/paginated-result";
import {UnitOfWork} from "../types";

@injectable()
export class RoleService {

	getRoles = async (
		context: SecurityContext,
		worldId: string,
		name: string,
		canAdmin: boolean,
		page: number,
		unitOfWork: UnitOfWork
	): Promise<PaginatedResult<Role>> => {

		const conditions: FilterCondition[] = [];

		if (worldId) {
			const world = await unitOfWork.worldRepository.findById(worldId);
			if (!world) {
				throw new Error("World does not exist");
			}
			if (!(await world.authorizationPolicy.canRead(context, unitOfWork))) {
				throw new Error("You do not have permission to read this World");
			}
			conditions.push(new FilterCondition("world", worldId));
		}

		if (name) {
			conditions.push(new FilterCondition("name", name, FILTER_CONDITION_REGEX));
		}

		const results = await unitOfWork.roleRepository.findPaginated(conditions, page);

		const roles = [];
		for (let role of results.docs) {
			if (canAdmin !== undefined && !(await role.authorizationPolicy.canAdmin(context, unitOfWork))) {
				continue;
			}
			if (await role.authorizationPolicy.canRead(context, unitOfWork)) {
				roles.push(role);
			}
		}
		results.docs = roles;
		return results;
	};
}
