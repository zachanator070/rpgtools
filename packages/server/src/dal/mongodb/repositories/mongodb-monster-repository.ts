import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Monster } from "../../../domain-entities/monster";
import { MonsterDocument, MonsterModel } from "../models/monster";
import { Model } from "mongoose";
import { MonsterRepository } from "../../../types";
import { injectable } from "inversify";

@injectable()
export class MongodbMonsterRepository
	extends AbstractMongodbRepository<Monster, MonsterDocument>
	implements MonsterRepository
{
	model: Model<any> = MonsterModel;

	buildEntity(document: MonsterDocument): Monster {
		return new Monster(
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
