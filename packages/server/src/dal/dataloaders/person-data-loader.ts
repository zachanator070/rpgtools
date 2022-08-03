import { GraphqlDataloader } from "../graphql-dataloader";
import { Person } from "../../domain-entities/person";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import { PersonRepository } from "../../types";
import { PersonAuthorizationPolicy } from "../../security/policy/person-authorization-policy";

@injectable()
export class PersonDataLoader extends GraphqlDataloader<Person> {

	@inject(INJECTABLE_TYPES.PersonRepository)
	repository: PersonRepository;

}
