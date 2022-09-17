import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { WikiFolder } from "../../../domain-entities/wiki-folder";
import { inject, injectable } from "inversify";
import { WikiFolderFactory} from "../../../types";
import mongoose from "mongoose";
import {WikiFolderDocument, WikiFolderModel} from "../models/wiki-folder";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";
import AclFactory from "./acl-factory";
import {WikiFolderRepository} from "../../repository/wiki-folder-repository";
import {FILTER_CONDITION_OPERATOR_IN, FilterCondition} from "../../filter-condition";

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

	findAll(): Promise<WikiFolder[]> {
		return this.find([]);
	}

	findOneWithPage(pageId: string): Promise<WikiFolder> {
		return this.findOne([new FilterCondition("pages", pageId, FILTER_CONDITION_OPERATOR_IN)]);
	}

	findOneWithChild(wikiFolderId: string): Promise<WikiFolder> {
		return this.findOne([new FilterCondition("children", wikiFolderId, FILTER_CONDITION_OPERATOR_IN)]);
	}
}
