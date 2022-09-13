import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Model } from "../../../domain-entities/model";
import mongoose from "mongoose";
import {ModelDocument, ModelModel} from "../models/model";
import { ModelFactory, ModelRepository } from "../../../types";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";
import AclFactory from "./acl-factory";

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
			{
				_id: document._id.toString(),
				world: document.world.toString(),
				name: document.name,
				depth: document.depth,
				width: document.width,
				height: document.height,
				fileName: document.fileName,
				fileId: document.fileId,
				notes: document.notes,
				acl: AclFactory(document.acl)
			}
		);
	}
}
