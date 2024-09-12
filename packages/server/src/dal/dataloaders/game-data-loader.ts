import { GraphqlDataloader } from "../graphql-dataloader.js";
import { Game } from "../../domain-entities/game.js";
import {injectable } from "inversify";
import {Repository} from "../repository/repository.js";
import {DatabaseContext} from "../database-context.js";

@injectable()
export class GameDataLoader extends GraphqlDataloader<Game> {
	getRepository(databaseContext: DatabaseContext): Repository<Game> {
		return databaseContext.gameRepository;
	}


}
