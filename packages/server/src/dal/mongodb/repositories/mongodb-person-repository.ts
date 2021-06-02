import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Person } from "../../../domain-entities/person";
import { injectable } from "inversify";
import { PersonRepository } from "../../../types";
import { Model } from "mongoose";
import { PersonDocument, PersonModel } from "../models/person";

@injectable()
export class MongodbPersonRepository
	extends AbstractMongodbRepository<Person, PersonDocument>
	implements PersonRepository {
	model: Model<any> = PersonModel;

	buildEntity(document: PersonDocument): Person {
		return new Person(
			document._id.toString(),
			document.name,
			document.world.toString(),
			document.coverImage.toString(),
			document.contentId.toString(),
			document.model.toString(),
			document.modelColor
		);
	}
}
