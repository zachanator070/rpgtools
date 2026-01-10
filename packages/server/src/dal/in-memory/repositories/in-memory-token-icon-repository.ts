import { TokenIcon } from "../../../domain-entities/token-icon.js";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository.js";
import {TokenIconRepository} from "../../repository/token-icon-repository.js";
import { PaginatedResult } from "../../paginated-result.js";
import { FilterCondition } from "../../filter-condition.js";
import { FILTER_CONDITION_OPERATOR_EQUALS } from "../../filter-condition.js";

@injectable()
export default class InMemoryTokenIconRepository extends AbstractInMemoryRepository<TokenIcon> implements TokenIconRepository {
    async getAllPaginated(page: number, worldId: string): Promise<PaginatedResult<TokenIcon>> {
        const conditions = [new FilterCondition("worldId", worldId, FILTER_CONDITION_OPERATOR_EQUALS)];
        return this.findPaginated(conditions, page);
    }
}
