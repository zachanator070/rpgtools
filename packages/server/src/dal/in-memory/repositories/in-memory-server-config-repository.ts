import { ServerConfig } from "../../../domain-entities/server-config.js";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository.js";
import {ServerConfigRepository} from "../../repository/server-config-repository.js";

@injectable()
export class InMemoryServerConfigRepository extends AbstractInMemoryRepository<ServerConfig> implements ServerConfigRepository {}
