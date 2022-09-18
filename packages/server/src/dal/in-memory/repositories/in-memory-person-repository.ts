import { Person } from "../../../domain-entities/person";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository";
import {PersonRepository} from "../../repository/person-repository";

@injectable()
export class InMemoryPersonRepository extends AbstractInMemoryRepository<Person> implements PersonRepository{}
