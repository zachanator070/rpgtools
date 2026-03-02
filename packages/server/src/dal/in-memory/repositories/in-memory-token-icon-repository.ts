import { TokenIcon } from "../../../domain-entities/token-icon.js";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository.js";
import {TokenIconRepository} from "../../repository/token-icon-repository.js";
import { PaginatedResult } from "../../paginated-result.js";
import { FilterCondition } from "../../filter-condition.js";
import { FILTER_CONDITION_OPERATOR_EQUALS, FILTER_CONDITION_REGEX } from "../../filter-condition.js";

@injectable()
export default class InMemoryTokenIconRepository extends AbstractInMemoryRepository<TokenIcon> implements TokenIconRepository {
    PAGE_LIMIT = 10;

    async getAllPaginated(page: number | undefined, name: string | undefined, worldId: string): Promise<PaginatedResult<TokenIcon>> {
        const conditions = [new FilterCondition("worldId", worldId, FILTER_CONDITION_OPERATOR_EQUALS)];
        if (name) {
            conditions.push(new FilterCondition("name", name, FILTER_CONDITION_REGEX));
        }
        return this.findPaginated(conditions, page || 1, 'name');
    }
}
