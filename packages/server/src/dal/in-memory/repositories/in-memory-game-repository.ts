import { Game } from "../../../domain-entities/game";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository";

@injectable()
export class InMemoryGameRepository extends AbstractInMemoryRepository<Game> {}
