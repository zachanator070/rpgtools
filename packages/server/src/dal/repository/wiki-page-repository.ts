import {Repository} from "./repository";
import {WikiPage} from "../../domain-entities/wiki-page";
import { PaginatedResult } from "../paginated-result";

export interface WikiPageRepository extends Repository<WikiPage>{
    findByIdsPaginated(ids: string[], page: number, sort?: string): Promise<PaginatedResult<WikiPage>>;
    findByNameAndTypesPaginatedSortByName(page: number, name?: string, types?: string[]): Promise<PaginatedResult<WikiPage>>;
    findOneByNameAndWorld(name: string, worldId: string): Promise<WikiPage>;
}