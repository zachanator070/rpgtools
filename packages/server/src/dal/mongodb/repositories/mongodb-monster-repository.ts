import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Monster } from "../../../domain-entities/monster";
import {MonsterDocument, MonsterModel} from "../models/monster";
import mongoose from "mongoose";
import { MonsterFactory, MonsterRepository } from "../../../types";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";
import AclFactory from "./acl-factory";

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
