import { GraphqlDataloader } from "../graphql-dataloader";
import { Game } from "../../domain-entities/game";
import {injectable } from "inversify";
import {Repository} from "../repository/repository";
import {DatabaseContext} from "../database-context";

@injectable()
export class GameDataLoader extends GraphqlDataloader<Game> {
	getRepository(databaseContext: DatabaseContext): Repository<Game> {
		return databaseContext.gameRepository;
	}


}
