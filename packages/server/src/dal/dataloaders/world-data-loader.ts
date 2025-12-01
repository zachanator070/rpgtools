import { GraphqlDataloader } from "../graphql-dataloader.js";
import { World } from "../../domain-entities/world.js";
import { injectable } from "inversify";
import {Repository} from "../repository/repository.js";
import {DatabaseContext} from "../database-context.js";

@injectable()
export class WorldDataLoader extends GraphqlDataloader<World> {
	getRepository(databaseContext: DatabaseContext): Repository<World> {
		return databaseContext.worldRepository;
	}

}
