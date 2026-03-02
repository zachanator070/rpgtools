import { Person } from "../../../domain-entities/person.js";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository.js";
import {PersonRepository} from "../../repository/person-repository.js";
import {inMemoryWikiPageStore} from "./in-memory-wiki-page-store.js";

@injectable()
export class InMemoryPersonRepository extends AbstractInMemoryRepository<Person> implements PersonRepository{
	items = inMemoryWikiPageStore as Map<string, Person>;
}
