import { World } from "../../../domain-entities/world";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository";

@injectable()
export class InMemoryWorldRepository extends AbstractInMemoryRepository<World> {}
