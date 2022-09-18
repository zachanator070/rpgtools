import {Repository} from "./repository";
import {World} from "../../domain-entities/world";
import {PaginatedResult} from "../paginated-result";

export interface WorldRepository extends Repository<World> {
    findByNamePaginated(name: string, page: number): Promise<PaginatedResult<World>>;
    findAllPaginated(page: number): Promise<PaginatedResult<World>>;
    findOneByWikiPage(pageId: string): Promise<World>;
    findByRootFolder(folderId: string): Promise<World[]>;
}