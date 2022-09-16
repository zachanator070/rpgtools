import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { WikiFolder } from "../../../domain-entities/wiki-folder";
import { inject, injectable } from "inversify";
import { WikiFolderFactory, WikiFolderRepository } from "../../../types";
import mongoose from "mongoose";
import {WikiFolderDocument, WikiFolderModel} from "../models/wiki-folder";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";
import AclFactory from "./acl-factory";

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
			{
				_id: document._id.toString(),
				name: document.name,
				world: document.world.toString(),
				pages: document.pages.map((id) => id.toString()),
				children: document.children.map((id) => id.toString()),
				acl: AclFactory(document.acl)
			}
		);
	}
}
