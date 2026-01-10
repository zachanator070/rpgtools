import {Repository} from "./repository.js";
import {TokenIcon} from "../../domain-entities/token-icon.js";
import { PaginatedResult } from "../paginated-result.js";

export interface TokenIconRepository extends Repository<TokenIcon> {
    getAllPaginated(page: number, name: string, worldId: string): Promise<PaginatedResult<TokenIcon>>;
}
