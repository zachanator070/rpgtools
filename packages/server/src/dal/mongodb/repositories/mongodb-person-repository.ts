import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Person } from "../../../domain-entities/person";
import { inject, injectable } from "inversify";
import mongoose from "mongoose";
import {PersonDocument, PersonModel} from "../models/person";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";
import {PersonRepository} from "../../repository/person-repository";
import PersonFactory from "../../../domain-entities/factory/person-factory";

@injectable()
export class MongodbPersonRepository
	extends AbstractMongodbRepository<Person, PersonDocument>
	implements PersonRepository
{
	@inject(INJECTABLE_TYPES.PersonFactory)
	personFactory: PersonFactory;

	model: mongoose.Model<any> = PersonModel;

}
