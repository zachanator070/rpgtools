import { GraphqlDataloader } from "../graphql-dataloader";
import { Pin } from "../../domain-entities/pin";
import { injectable } from "inversify";
import {UnitOfWork} from "../../types";
import {Repository} from "../repository/repository";

@injectable()
export class PinDataLoader extends GraphqlDataloader<Pin> {
	getRepository(unitOfWork: UnitOfWork): Repository<Pin> {
		return unitOfWork.pinRepository;
	}

}
