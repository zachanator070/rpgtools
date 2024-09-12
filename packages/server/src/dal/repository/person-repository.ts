import {Repository} from "./repository.js";
import {Person} from "../../domain-entities/person.js";

export interface PersonRepository extends Repository<Person>{}