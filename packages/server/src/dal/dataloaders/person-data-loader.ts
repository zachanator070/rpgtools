import { GraphqlDataloader } from "../graphql-dataloader.js";
import { Person } from "../../domain-entities/person.js";
import { injectable } from "inversify";
import {Repository} from "../repository/repository.js";
import {DatabaseContext} from "../database-context.js";

@injectable()
export class PersonDataLoader extends GraphqlDataloader<Person> {
	getRepository(databaseContext: DatabaseContext): Repository<Person> {
		return databaseContext.personRepository;
	}

}
