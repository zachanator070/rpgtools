import {Repository} from "./repository.js";
import {Game} from "../../domain-entities/game.js";

export interface GameRepository extends Repository<Game>{
    findWithModel(modelId: string): Promise<Game[]>;
    findByPlayer(userId: string): Promise<Game[]>;
}