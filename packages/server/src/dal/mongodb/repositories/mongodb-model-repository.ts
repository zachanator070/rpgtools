import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Model } from "../../../domain-entities/model";
import mongoose from "mongoose";
import {ModelDocument, ModelModel} from "../models/model";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";
import {ModelRepository} from "../../repository/model-repository";
import {FilterCondition} from "../../filter-condition";
import ModelFactory from "../../../domain-entities/factory/model-factory";

@injectable()
export class MongodbModelRepository
	extends AbstractMongodbRepository<Model, ModelDocument>
	implements ModelRepository
{
	@inject(INJECTABLE_TYPES.ModelFactory)
	modelFactory: ModelFactory;

	model: mongoose.Model<any> = ModelModel;


	findByWorld(worldId: string): Promise<Model[]> {
		return this.find([new FilterCondition("world", worldId)]);
	}
}
