import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { World } from "../../../domain-entities/world";
import { inject, injectable } from "inversify";
import { WorldDocument, WorldFactory, WorldRepository } from "../../../types";
import mongoose from "mongoose";
import { WorldModel } from "../models/world";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";

@injectable()
export class MongodbWorldRepository
	extends AbstractMongodbRepository<World, WorldDocument>
	implements WorldRepository
{
	@inject(INJECTABLE_TYPES.WorldFactory)
	worldFactory: WorldFactory;

	model: mongoose.Model<any> = WorldModel;

	buildEntity(document: WorldDocument): World {
		return this.worldFactory(
			{
				_id: document._id.toString(),
				name: document.name,
				wikiPage: document.wikiPage?.toString(),
				rootFolder: document.rootFolder?.toString()
			}
		);
	}
}
