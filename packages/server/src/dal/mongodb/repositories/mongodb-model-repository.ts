import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Model } from "../../../domain-entities/model";
import mongoose from "mongoose";
import { ModelModel } from "../models/model";
import { ModelDocument, ModelFactory, ModelRepository } from "../../../types";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";

@injectable()
export class MongodbModelRepository
	extends AbstractMongodbRepository<Model, ModelDocument>
	implements ModelRepository
{
	@inject(INJECTABLE_TYPES.ModelFactory)
	modelFactory: ModelFactory;

	model: mongoose.Model<any> = ModelModel;

	buildEntity(document: ModelDocument): Model {
		return this.modelFactory(
			document._id.toString(),
			document.world.toString(),
			document.name,
			document.depth,
			document.width,
			document.height,
			document.fileName,
			document.fileId,
			document.notes
		);
	}
}
