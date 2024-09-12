import { GraphqlDataloader } from "../graphql-dataloader.js";
import { User } from "../../domain-entities/user.js";
import { injectable } from "inversify";
import {Repository} from "../repository/repository.js";
import {DatabaseContext} from "../database-context.js";

@injectable()
export class UserDataLoader extends GraphqlDataloader<User> {
	getRepository(databaseContext: DatabaseContext): Repository<User> {
		return databaseContext.userRepository;
	}

}
