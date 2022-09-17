import { GraphqlDataloader } from "../graphql-dataloader";
import { Monster } from "../../domain-entities/monster";
import {injectable } from "inversify";
import {UnitOfWork} from "../../types";
import {Repository} from "../repository/repository";

@injectable()
export class MonsterDataLoader extends GraphqlDataloader<Monster> {

	getRepository(unitOfWork: UnitOfWork): Repository<Monster> {
		return unitOfWork.monsterRepository;
	}

}
