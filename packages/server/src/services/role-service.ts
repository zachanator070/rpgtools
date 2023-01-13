import { Role } from "../domain-entities/role";
import {injectable} from "inversify";
import { SecurityContext } from "../security/security-context";
import { PaginatedResult } from "../dal/paginated-result";
import {DatabaseContext} from "../dal/database-context";

@injectable()
export class RoleService {

	getRoles = async (
		context: SecurityContext,
		worldId: string,
		name: string,
		canAdmin: boolean,
		page: number,
		databaseContext: DatabaseContext
	): Promise<PaginatedResult<Role>> => {
		if (worldId) {
			const world = await databaseContext.worldRepository.findOneById(worldId);
			if (!world) {
				throw new Error("World does not exist");
			}
			if (!(await world.authorizationPolicy.canRead(context, databaseContext))) {
				throw new Error("You do not have permission to read this World");
			}
		}

		const results = await databaseContext.roleRepository.findByWorldAndNamePaginated(worldId, page, name);

		const roles = [];
		for (let role of results.docs) {
			if (canAdmin !== undefined && !(await role.authorizationPolicy.canAdmin(context, databaseContext))) {
				continue;
			}
			if (await role.authorizationPolicy.canRead(context, databaseContext)) {
				roles.push(role);
			}
		}
		results.docs = roles;
		return results;
	};
}
