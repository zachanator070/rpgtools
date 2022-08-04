import { GraphqlDataloader } from "../graphql-dataloader";
import { Model } from "../../domain-entities/model";
import { injectable } from "inversify";
import {Repository, UnitOfWork} from "../../types";

@injectable()
export class ModelDataLoader extends GraphqlDataloader<Model> {
	getRepository(unitOfWork: UnitOfWork): Repository<Model> {
		return unitOfWork.modelRepository;
	}

}
