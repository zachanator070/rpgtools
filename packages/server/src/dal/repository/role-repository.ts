import {Repository} from "./repository";
import {Role} from "../../domain-entities/role";
import {PaginatedResult} from "../paginated-result";

export interface RoleRepository extends Repository<Role> {
    findOneByName(name: string): Promise<Role>;
    findByWorldAndNamePaginated(worldId: string, page: number, name?: string): Promise<PaginatedResult<Role>>;
}