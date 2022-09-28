import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Monster } from "../../../domain-entities/monster";
import {MonsterDocument, MonsterModel} from "../models/monster";
import mongoose from "mongoose";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";
import {MonsterRepository} from "../../repository/monster-repository";
import MonsterFactory from "../../../domain-entities/factory/monster-factory";

@injectable()
export class MongodbMonsterRepository
	extends AbstractMongodbRepository<Monster, MonsterDocument>
	implements MonsterRepository
{
	@inject(INJECTABLE_TYPES.MonsterFactory)
	monsterFactory: MonsterFactory;

	model: mongoose.Model<any> = MonsterModel;

}
