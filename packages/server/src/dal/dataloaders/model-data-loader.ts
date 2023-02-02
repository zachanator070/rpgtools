import { GraphqlDataloader } from "../graphql-dataloader";
import { Model } from "../../domain-entities/model";
import { injectable } from "inversify";
import {Repository} from "../repository/repository";
import {DatabaseContext} from "../database-context";

@injectable()
export class ModelDataLoader extends GraphqlDataloader<Model> {
	getRepository(databaseContext: DatabaseContext): Repository<Model> {
		return databaseContext.modelRepository;
	}

}
