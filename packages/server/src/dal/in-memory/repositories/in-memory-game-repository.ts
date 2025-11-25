import { Game } from "../../../domain-entities/game.js";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository.js";
import {GameRepository} from "../../repository/game-repository.js";
import {FilterCondition} from "../../filter-condition.js";

@injectable()
export class InMemoryGameRepository extends AbstractInMemoryRepository<Game> implements GameRepository{

    findWithModel(modelId: string): Promise<Game[]> {
        return this.find([new FilterCondition("models", {_id: modelId})])
    }

    findByPlayer(userId: string): Promise<Game[]> {
        return this.find([new FilterCondition("characters.player", userId)]);
    }
}
