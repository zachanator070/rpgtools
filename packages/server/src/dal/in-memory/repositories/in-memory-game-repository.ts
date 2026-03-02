import { Game } from "../../../domain-entities/game.js";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository.js";
import {GameRepository} from "../../repository/game-repository.js";

@injectable()
export class InMemoryGameRepository extends AbstractInMemoryRepository<Game> implements GameRepository{

    async findWithModel(modelId: string): Promise<Game[]> {
        const games = await this.findAll();
        return games.filter((game) => game.models.some((model) => model.model === modelId));
    }

    async findByPlayer(userId: string): Promise<Game[]> {
        const games = await this.findAll();
        return games.filter((game) => game.characters.some((character) => character.player === userId));
    }
}
