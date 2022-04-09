import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { WikiFolder } from "../../../domain-entities/wiki-folder";
import { inject, injectable } from "inversify";
import { WikiFolderDocument, WikiFolderFactory, WikiFolderRepository } from "../../../types";
import mongoose from "mongoose";
import { WikiFolderModel } from "../models/wiki-folder";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";

@injectable()
export class MongodbWikiFolderRepository
	extends AbstractMongodbRepository<WikiFolder, WikiFolderDocument>
	implements WikiFolderRepository
{
	@inject(INJECTABLE_TYPES.WikiFolderFactory)
	wikiFolderFactory: WikiFolderFactory;

	model: mongoose.Model<any> = WikiFolderModel;

	buildEntity(document: WikiFolderDocument): WikiFolder {
		return this.wikiFolderFactory(
			document._id.toString(),
			document.name,
			document.world.toString(),
			document.pages.map((id) => id.toString()),
			document.children.map((id) => id.toString())
		);
	}
}
