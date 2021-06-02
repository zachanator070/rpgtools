import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { World } from "../../../domain-entities/world";
import { injectable } from "inversify";
import { WorldRepository } from "../../../types";
import { Model } from "mongoose";
import { WorldDocument, WorldModel } from "../models/world";

@injectable()
export class MongodbWorldRepository
	extends AbstractMongodbRepository<World, WorldDocument>
	implements WorldRepository {
	model: Model<any> = WorldModel;

	buildEntity(document: WorldDocument): World {
		return new World(
			document._id.toString(),
			document.name,
			document.wikiPage.toString(),
			document.rootFolder.toString(),
			document.roles.map((id) => id.toString()),
			document.pins.map((id) => id.toString())
		);
	}
}
