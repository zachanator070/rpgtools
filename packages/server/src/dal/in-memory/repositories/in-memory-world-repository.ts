import { World } from "../../../domain-entities/world";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository";
import {WorldRepository} from "../../repository/world-repository";
import {PaginatedResult} from "../../paginated-result";
import {FILTER_CONDITION_REGEX, FilterCondition} from "../../filter-condition";

@injectable()
export class InMemoryWorldRepository extends AbstractInMemoryRepository<World> implements WorldRepository {
    findAllPaginated(page: number): Promise<PaginatedResult<World>> {
        return this.findPaginated([], page);
    }

    findByNamePaginated(name: string, page: number): Promise<PaginatedResult<World>> {
        return this.findPaginated([new FilterCondition("name", name, FILTER_CONDITION_REGEX)], page);
    }

    findOneByWikiPage(pageId: string): Promise<World> {
        return this.findOne([
            new FilterCondition("wikiPage", pageId),
        ]);
    }

    findByRootFolder(folderId: string): Promise<World[]> {
        return this.find([
            new FilterCondition("rootFolder", folderId),
        ]);
    }
}
