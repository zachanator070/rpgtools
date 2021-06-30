import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { World } from "../../../domain-entities/world";
import { inject, injectable } from "inversify";
import { WorldFactory, WorldRepository } from "../../../types";
import { Model } from "mongoose";
import { WorldDocument, WorldModel } from "../models/world";
import { INJECTABLE_TYPES } from "../../../injectable-types";

@injectable()
export class MongodbWorldRepository
	extends AbstractMongodbRepository<World, WorldDocument>
	implements WorldRepository
{
	@inject(INJECTABLE_TYPES.WorldFactory)
	worldFactory: WorldFactory;

	model: Model<any> = WorldModel;

	buildEntity(document: WorldDocument): World {
		return this.worldFactory(
			document._id.toString(),
			document.name,
			document.wikiPage.toString(),
			document.rootFolder.toString(),
			document.roles.map((id) => id.toString()),
			document.pins.map((id) => id.toString())
		);
	}
}
