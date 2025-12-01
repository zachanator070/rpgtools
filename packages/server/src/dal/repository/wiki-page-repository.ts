import {Repository} from "./repository.js";
import {WikiPage} from "../../domain-entities/wiki-page.js";
import { PaginatedResult } from "../paginated-result.js";

export interface WikiPageRepository extends Repository<WikiPage>{
    findByIdsPaginated(ids: string[], page: number, sort?: string): Promise<PaginatedResult<WikiPage>>;
    findByNameAndTypesPaginatedSortByName(page: number, name?: string, types?: string[]): Promise<PaginatedResult<WikiPage>>;
    findOneByNameAndWorld(name: string, worldId: string): Promise<WikiPage>;
}