import {Repository} from "./repository.js";
import {World} from "../../domain-entities/world.js";
import {PaginatedResult} from "../paginated-result.js";

export interface WorldRepository extends Repository<World> {
    findByNamePaginated(name: string, page: number): Promise<PaginatedResult<World>>;
    findAllPaginated(page: number): Promise<PaginatedResult<World>>;
    findOneByWikiPage(pageId: string): Promise<World>;
    findByRootFolder(folderId: string): Promise<World[]>;
}