import {Repository} from "./repository";
import {User} from "../../domain-entities/user";

export interface UserRepository extends Repository<User>{}