import { injectable } from "inversify";
import { WikiPage } from "../../../domain-entities/wiki-page.js";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository.js";
import {WikiPageRepository} from "../../repository/wiki-page-repository.js";
import {PaginatedResult} from "../../paginated-result.js";
import {FILTER_CONDITION_OPERATOR_IN, FILTER_CONDITION_REGEX, FilterCondition} from "../../filter-condition.js";
import {EVENT_WIKI} from "@rpgtools/common/src/type-constants.js";

@injectable()
export class InMemoryWikiPageRepository extends AbstractInMemoryRepository<WikiPage> implements WikiPageRepository {

    findByIdsPaginated(ids: string[], page: number, sort?: string): Promise<PaginatedResult<WikiPage>> {
        return this.findPaginated([new FilterCondition('_id', ids, FILTER_CONDITION_OPERATOR_IN)], page, sort);
    }

    findByNameAndTypesPaginatedSortByName(page: number, name?: string, types?: string[]): Promise<PaginatedResult<WikiPage>> {
        const conditions = [];
        if(name) {
            conditions.push(new FilterCondition('name', name, FILTER_CONDITION_REGEX));
        }
        if(types && types.length > 0){
            conditions.push(new FilterCondition('type', types, FILTER_CONDITION_OPERATOR_IN));
        }
        return this.findPaginated(conditions, page, 'name');
    }

    findOneByNameAndWorld(name: string, worldId: string): Promise<WikiPage> {
        return this.findOne([
            new FilterCondition("name", "other page"),
            new FilterCondition("world", worldId),
        ]);
    }
}
