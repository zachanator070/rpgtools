import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Model } from "../../../domain-entities/model";
import { Model as MongoDBModel } from "mongoose";
import { ModelDocument, ModelModel } from "../models/model";
import { ModelRepository } from "../../../types";
import { injectable } from "inversify";

@injectable()
export class MongodbModelRepository
	extends AbstractMongodbRepository<Model, ModelDocument>
	implements ModelRepository {
	model: MongoDBModel<any> = ModelModel;

	buildEntity(document: ModelDocument): Model {
		return new Model(
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
