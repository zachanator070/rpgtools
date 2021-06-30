import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Person } from "../../../domain-entities/person";
import { inject, injectable } from "inversify";
import { PersonFactory, PersonRepository } from "../../../types";
import { Model } from "mongoose";
import { PersonDocument, PersonModel } from "../models/person";
import { INJECTABLE_TYPES } from "../../../injectable-types";

@injectable()
export class MongodbPersonRepository
	extends AbstractMongodbRepository<Person, PersonDocument>
	implements PersonRepository
{
	@inject(INJECTABLE_TYPES.PersonFactory)
	personFactory: PersonFactory;

	model: Model<any> = PersonModel;

	buildEntity(document: PersonDocument): Person {
		return this.personFactory(
			document._id.toString(),
			document.name,
			document.world.toString(),
			document.coverImage ? document.coverImage.toString() : null,
			document.contentId ? document.contentId.toString() : null,
			document.pageModel ? document.pageModel.toString() : null,
			document.modelColor
		);
	}
}
