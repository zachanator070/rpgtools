import {Repository} from "./repository";
import {Role} from "../../domain-entities/role";

export interface RoleRepository extends Repository<Role> {
    findOneByName(name: string): Promise<Role>;
}