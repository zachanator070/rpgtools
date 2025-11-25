import {Repository} from "./repository.js";
import {Role} from "../../domain-entities/role.js";
import {PaginatedResult} from "../paginated-result.js";

export interface RoleRepository extends Repository<Role> {
    findOneByName(name: string): Promise<Role>;
    findByWorldAndNamePaginated(worldId: string, page: number, name?: string): Promise<PaginatedResult<Role>>;
}