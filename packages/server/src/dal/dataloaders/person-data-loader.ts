import { GraphqlDataloader } from "../graphql-dataloader";
import { Person } from "../../domain-entities/person";
import { inject } from "inversify";
import { INJECTABLE_TYPES } from "../../injectable-types";
import { PersonRepository } from "../../types";
import { PersonAuthorizationRuleset } from "../../security/person-authorization-ruleset";

export class PersonDataLoader extends GraphqlDataloader<Person> {
	constructor(@inject(INJECTABLE_TYPES.PersonRepository) repo: PersonRepository) {
		super(repo, new PersonAuthorizationRuleset());
	}
}
