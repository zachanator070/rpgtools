import { GraphqlDataloader } from "../graphql-dataloader";
import { Monster } from "../../domain-entities/monster";
import {injectable } from "inversify";
import {Repository} from "../repository/repository";
import {DatabaseContext} from "../database-context";

@injectable()
export class MonsterDataLoader extends GraphqlDataloader<Monster> {

	getRepository(databaseContext: DatabaseContext): Repository<Monster> {
		return databaseContext.monsterRepository;
	}

}
