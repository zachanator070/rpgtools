import { ServerConfig } from "../../../domain-entities/server-config";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository";

@injectable()
export class InMemoryServerConfigRepository extends AbstractInMemoryRepository<ServerConfig> {}
