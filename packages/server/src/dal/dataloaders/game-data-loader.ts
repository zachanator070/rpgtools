import { GraphqlDataloader } from "../graphql-dataloader";
import { Game } from "../../domain-entities/game";
import {injectable } from "inversify";
import {Repository, UnitOfWork} from "../../types";

@injectable()
export class GameDataLoader extends GraphqlDataloader<Game> {
	getRepository(unitOfWork: UnitOfWork): Repository<Game> {
		return unitOfWork.gameRepository;
	}


}
