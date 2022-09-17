import { GraphqlDataloader } from "../graphql-dataloader";
import { Game } from "../../domain-entities/game";
import {injectable } from "inversify";
import {UnitOfWork} from "../../types";
import {Repository} from "../repository/repository";

@injectable()
export class GameDataLoader extends GraphqlDataloader<Game> {
	getRepository(unitOfWork: UnitOfWork): Repository<Game> {
		return unitOfWork.gameRepository;
	}


}
