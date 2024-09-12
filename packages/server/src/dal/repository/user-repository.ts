import {Repository} from "./repository.js";
import {User} from "../../domain-entities/user.js";
import {PaginatedResult} from "../paginated-result.js";

export interface UserRepository extends Repository<User>{
    findByUsernamePaginated(username: string, page: number): Promise<PaginatedResult<User>>;
    findWithRole(roleId: string): Promise<User[]>;
    findOneByUsername(username: string): Promise<User>;
    findByUsername(username: string): Promise<User[]>;
    findByEmail(email: string): Promise<User[]>;
}