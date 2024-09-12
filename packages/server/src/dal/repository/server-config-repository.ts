import {Repository} from "./repository.js";
import {ServerConfig} from "../../domain-entities/server-config.js";

export interface ServerConfigRepository extends Repository<ServerConfig> {
    findOne(): Promise<ServerConfig>;
}