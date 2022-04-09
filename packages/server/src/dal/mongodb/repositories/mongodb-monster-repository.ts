import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Monster } from "../../../domain-entities/monster";
import { MonsterModel } from "../models/monster";
import mongoose from "mongoose";
import { MonsterDocument, MonsterFactory, MonsterRepository } from "../../../types";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";

@injectable()
export class MongodbMonsterRepository
	extends AbstractMongodbRepository<Monster, MonsterDocument>
	implements MonsterRepository
{
	@inject(INJECTABLE_TYPES.MonsterFactory)
	monsterFactory: MonsterFactory;

	model: mongoose.Model<any> = MonsterModel;

	buildEntity(document: MonsterDocument): Monster {
		return this.monsterFactory(
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
