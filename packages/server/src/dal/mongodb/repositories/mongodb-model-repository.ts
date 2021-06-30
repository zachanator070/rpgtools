import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Model } from "../../../domain-entities/model";
import { Model as MongoDBModel } from "mongoose";
import { ModelDocument, ModelModel } from "../models/model";
import { ModelFactory, ModelRepository } from "../../../types";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../../injectable-types";

@injectable()
export class MongodbModelRepository
	extends AbstractMongodbRepository<Model, ModelDocument>
	implements ModelRepository
{
	@inject(INJECTABLE_TYPES.ModelFactory)
	modelFactory: ModelFactory;

	model: MongoDBModel<any> = ModelModel;

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
