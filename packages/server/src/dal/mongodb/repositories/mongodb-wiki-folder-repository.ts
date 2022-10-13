import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { WikiFolder } from "../../../domain-entities/wiki-folder";
import { inject, injectable } from "inversify";
import mongoose from "mongoose";
import {WikiFolderDocument, WikiFolderModel} from "../models/wiki-folder";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";
import {WikiFolderRepository} from "../../repository/wiki-folder-repository";
import {FILTER_CONDITION_OPERATOR_IN, FILTER_CONDITION_REGEX, FilterCondition} from "../../filter-condition";
import WikiFolderFactory from "../../../domain-entities/factory/wiki-folder-factory";

@injectable()
export class MongodbWikiFolderRepository
	extends AbstractMongodbRepository<WikiFolder, WikiFolderDocument>
	implements WikiFolderRepository
{
	@inject(INJECTABLE_TYPES.WikiFolderFactory)
	entityFactory: WikiFolderFactory;

	model: mongoose.Model<any> = WikiFolderModel;

	findOneWithPage(pageId: string): Promise<WikiFolder> {
		return this.findOne([new FilterCondition("pages", pageId, FILTER_CONDITION_OPERATOR_IN)]);
	}

	findOneWithChild(wikiFolderId: string): Promise<WikiFolder> {
		return this.findOne([new FilterCondition("children", wikiFolderId, FILTER_CONDITION_OPERATOR_IN)]);
	}

	findByWorldAndName(worldId: string, name?: string): Promise<WikiFolder[]> {
		const conditions: FilterCondition[] = [new FilterCondition("world", worldId)];
		if (name) {
			conditions.push(new FilterCondition("name", name, FILTER_CONDITION_REGEX));
		}
		return this.find(conditions);
	}

	findOneByNameAndWorld(name: string, worldId: string): Promise<WikiFolder> {
		return this.findOne([
			new FilterCondition("name", name),
			new FilterCondition("world", worldId),
		]);
	}
}
