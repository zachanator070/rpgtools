import { Person } from "../../../domain-entities/person.js";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository.js";
import {PersonRepository} from "../../repository/person-repository.js";

@injectable()
export class InMemoryPersonRepository extends AbstractInMemoryRepository<Person> implements PersonRepository{}
