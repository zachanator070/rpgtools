import { GraphqlDataloader } from "../graphql-dataloader.js";
import { Model } from "../../domain-entities/model.js";
import { injectable } from "inversify";
import {Repository} from "../repository/repository.js";
import {DatabaseContext} from "../database-context.js";

@injectable()
export class ModelDataLoader extends GraphqlDataloader<Model> {
	getRepository(databaseContext: DatabaseContext): Repository<Model> {
		return databaseContext.modelRepository;
	}

}
