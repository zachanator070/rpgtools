import { GraphqlDataloader } from "../graphql-dataloader";
import { Model } from "../../domain-entities/model";
import { injectable } from "inversify";
import {UnitOfWork} from "../../types";
import {Repository} from "../repository/repository";

@injectable()
export class ModelDataLoader extends GraphqlDataloader<Model> {
	getRepository(unitOfWork: UnitOfWork): Repository<Model> {
		return unitOfWork.modelRepository;
	}

}
