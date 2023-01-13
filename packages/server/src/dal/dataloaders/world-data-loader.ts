import { GraphqlDataloader } from "../graphql-dataloader";
import { World } from "../../domain-entities/world";
import { injectable } from "inversify";
import {Repository} from "../repository/repository";
import {DatabaseContext} from "../database-context";

@injectable()
export class WorldDataLoader extends GraphqlDataloader<World> {
	getRepository(databaseContext: DatabaseContext): Repository<World> {
		return databaseContext.worldRepository;
	}

}
