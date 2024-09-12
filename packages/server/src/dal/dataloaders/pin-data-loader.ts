import { GraphqlDataloader } from "../graphql-dataloader.js";
import { Pin } from "../../domain-entities/pin.js";
import { injectable } from "inversify";
import {Repository} from "../repository/repository.js";
import {DatabaseContext} from "../database-context.js";

@injectable()
export class PinDataLoader extends GraphqlDataloader<Pin> {
	getRepository(databaseContext: DatabaseContext): Repository<Pin> {
		return databaseContext.pinRepository;
	}

}
