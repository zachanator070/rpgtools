import {Repository} from "./repository";
import {Game} from "../../domain-entities/game";

export interface GameRepository extends Repository<Game>{
    findWithModel(modelId: string): Promise<Game[]>;
    findByPlayer(userId: string): Promise<Game[]>;
}