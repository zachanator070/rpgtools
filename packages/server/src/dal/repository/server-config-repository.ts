import {Repository} from "./repository";
import {ServerConfig} from "../../domain-entities/server-config";

export interface ServerConfigRepository extends Repository<ServerConfig> {
    findOne(): Promise<ServerConfig>;
}