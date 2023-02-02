import { GraphqlDataloader } from "../graphql-dataloader";
import { Pin } from "../../domain-entities/pin";
import { injectable } from "inversify";
import {Repository} from "../repository/repository";
import {DatabaseContext} from "../database-context";

@injectable()
export class PinDataLoader extends GraphqlDataloader<Pin> {
	getRepository(databaseContext: DatabaseContext): Repository<Pin> {
		return databaseContext.pinRepository;
	}

}
