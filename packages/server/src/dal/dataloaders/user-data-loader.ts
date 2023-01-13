import { GraphqlDataloader } from "../graphql-dataloader";
import { User } from "../../domain-entities/user";
import { injectable } from "inversify";
import {Repository} from "../repository/repository";
import {DatabaseContext} from "../database-context";

@injectable()
export class UserDataLoader extends GraphqlDataloader<User> {
	getRepository(databaseContext: DatabaseContext): Repository<User> {
		return databaseContext.userRepository;
	}

}
