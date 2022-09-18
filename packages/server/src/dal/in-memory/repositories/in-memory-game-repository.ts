import { Game } from "../../../domain-entities/game";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository";
import {GameRepository} from "../../repository/game-repository";
import {FilterCondition} from "../../filter-condition";

@injectable()
export class InMemoryGameRepository extends AbstractInMemoryRepository<Game> implements GameRepository{

    findWithModel(modelId: string): Promise<Game[]> {
        return this.find([new FilterCondition("models", {_id: modelId})])
    }

    findByPlayer(userId: string): Promise<Game[]> {
        return this.find([new FilterCondition("characters.player", userId)]);
    }
}
