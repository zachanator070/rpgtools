import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Person } from "../../../domain-entities/person";
import { inject, injectable } from "inversify";
import { PersonFactory, PersonRepository } from "../../../types";
import mongoose from "mongoose";
import {PersonDocument, PersonModel} from "../models/person";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";
import AclFactory from "./acl-factory";

@injectable()
export class MongodbPersonRepository
	extends AbstractMongodbRepository<Person, PersonDocument>
	implements PersonRepository
{
	@inject(INJECTABLE_TYPES.PersonFactory)
	personFactory: PersonFactory;

	model: mongoose.Model<any> = PersonModel;

	buildEntity(document: PersonDocument): Person {
		return this.personFactory(
			{
				_id: document._id.toString(),
				name: document.name,
				world: document.world.toString(),
				coverImage: document.coverImage ? document.coverImage.toString() : null,
				contentId: document.contentId ? document.contentId.toString() : null,
				pageModel: document.pageModel ? document.pageModel.toString() : null,
				modelColor: document.modelColor,
				acl: AclFactory(document.acl)
			}
		);
	}
}
