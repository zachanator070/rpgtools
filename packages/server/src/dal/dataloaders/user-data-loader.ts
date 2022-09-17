import { GraphqlDataloader } from "../graphql-dataloader";
import { User } from "../../domain-entities/user";
import { injectable } from "inversify";
import {UnitOfWork} from "../../types";
import {Repository} from "../repository/repository";

@injectable()
export class UserDataLoader extends GraphqlDataloader<User> {
	getRepository(unitOfWork: UnitOfWork): Repository<User> {
		return unitOfWork.userRepository;
	}

}
