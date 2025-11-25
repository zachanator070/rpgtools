import { GraphqlDataloader } from "../graphql-dataloader.js";
import { Monster } from "../../domain-entities/monster.js";
import {injectable } from "inversify";
import {Repository} from "../repository/repository.js";
import {DatabaseContext} from "../database-context.js";

@injectable()
export class MonsterDataLoader extends GraphqlDataloader<Monster> {

	getRepository(databaseContext: DatabaseContext): Repository<Monster> {
		return databaseContext.monsterRepository;
	}

}
