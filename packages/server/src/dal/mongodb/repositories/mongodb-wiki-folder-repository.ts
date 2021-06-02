import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { WikiFolder } from "../../../domain-entities/wiki-folder";
import { injectable } from "inversify";
import { WikiFolderRepository } from "../../../types";
import { Model } from "mongoose";
import { WikiFolderDocument, WikiFolderModel } from "../models/wiki-folder";

@injectable()
export class MongodbWikiFolderRepository
	extends AbstractMongodbRepository<WikiFolder, WikiFolderDocument>
	implements WikiFolderRepository {
	model: Model<any> = WikiFolderModel;

	buildEntity(document: WikiFolderDocument): WikiFolder {
		return new WikiFolder(
			document._id.toString(),
			document.name,
			document.world.toString(),
			document.pages.map((id) => id.toString()),
			document.children.map((id) => id.toString())
		);
	}
}
