import { GraphqlDataloader } from "../graphql-dataloader.js";
import { TokenIcon } from "../../domain-entities/token-icon.js";
import {injectable } from "inversify";
import {Repository} from "../repository/repository.js";
import {DatabaseContext} from "../database-context.js";

@injectable()
export class TokenIconDataLoader extends GraphqlDataloader<TokenIcon> {
	getRepository(databaseContext: DatabaseContext): Repository<TokenIcon> {
		return databaseContext.tokenIconRepository;
	}

}
