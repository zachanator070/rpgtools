import { ServerConfig } from "../../../domain-entities/server-config";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository";
import {ServerConfigRepository} from "../../repository/server-config-repository";

@injectable()
export class InMemoryServerConfigRepository extends AbstractInMemoryRepository<ServerConfig> implements ServerConfigRepository {}
