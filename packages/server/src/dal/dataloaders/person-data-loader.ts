import { GraphqlDataloader } from "../graphql-dataloader";
import { Person } from "../../domain-entities/person";
import { injectable } from "inversify";
import {Repository} from "../repository/repository";
import {DatabaseContext} from "../database-context";

@injectable()
export class PersonDataLoader extends GraphqlDataloader<Person> {
	getRepository(databaseContext: DatabaseContext): Repository<Person> {
		return databaseContext.personRepository;
	}

}
