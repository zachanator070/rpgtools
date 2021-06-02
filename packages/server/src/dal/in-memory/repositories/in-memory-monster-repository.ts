import { Monster } from "../../../domain-entities/monster";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository";

@injectable()
export class InMemoryMonsterRepository extends AbstractInMemoryRepository<Monster> {}
