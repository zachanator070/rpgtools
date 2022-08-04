import { GraphqlDataloader } from "../graphql-dataloader";
import { User } from "../../domain-entities/user";
import { injectable } from "inversify";
import {Repository, UnitOfWork} from "../../types";

@injectable()
export class UserDataLoader extends GraphqlDataloader<User> {
	getRepository(unitOfWork: UnitOfWork): Repository<User> {
		return unitOfWork.userRepository;
	}

}
