import { Role } from "../../../domain-entities/role.js";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository.js";
import {RoleRepository} from "../../repository/role-repository.js";
import {FILTER_CONDITION_REGEX, FilterCondition} from "../../filter-condition.js";
import {PaginatedResult} from "../../paginated-result.js";

@injectable()
export class InMemoryRoleRepository extends AbstractInMemoryRepository<Role> implements RoleRepository {

    findOneByName(name: string): Promise<Role> {
        return this.findOne([new FilterCondition('name', name)]);
    }

    findByWorldAndNamePaginated(worldId: string, page: number, name?: string): Promise<PaginatedResult<Role>> {
        const conditions: FilterCondition[] = [];

        if (worldId) {
            conditions.push(new FilterCondition("world", worldId));
        }

        if (name) {
            conditions.push(new FilterCondition("name", name, FILTER_CONDITION_REGEX));
        }
        return this.findPaginated(conditions, page);
    }
}
