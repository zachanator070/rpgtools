import {Repository} from "./repository";
import {Person} from "../../domain-entities/person";

export interface PersonRepository extends Repository<Person>{}