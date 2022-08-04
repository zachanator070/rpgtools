import { GraphqlDataloader } from "../graphql-dataloader";
import { Monster } from "../../domain-entities/monster";
import {injectable } from "inversify";
import {Repository, UnitOfWork} from "../../types";

@injectable()
export class MonsterDataLoader extends GraphqlDataloader<Monster> {

	getRepository(unitOfWork: UnitOfWork): Repository<Monster> {
		return unitOfWork.monsterRepository;
	}

}
