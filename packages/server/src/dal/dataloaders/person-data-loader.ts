import { GraphqlDataloader } from "../graphql-dataloader";
import { Person } from "../../domain-entities/person";
import { injectable } from "inversify";
import {UnitOfWork} from "../../types";
import {Repository} from "../repository/repository";

@injectable()
export class PersonDataLoader extends GraphqlDataloader<Person> {
	getRepository(unitOfWork: UnitOfWork): Repository<Person> {
		return unitOfWork.personRepository;
	}

}
