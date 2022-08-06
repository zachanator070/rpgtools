import {inject, injectable, multiInject} from "inversify";
import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import {
	DomainEntity,
	WikiPageDocument,
	WikiPageRepository,
} from "../../../types";
import mongoose from "mongoose";
import { WikiPage } from "../../../domain-entities/wiki-page";
import { WikiPageModel } from "../models/wiki-page";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";


@injectable()
export class MongodbWikiPageRepository
	extends AbstractMongodbRepository<WikiPage, WikiPageDocument>
	implements WikiPageRepository
{
	model: mongoose.Model<any> = WikiPageModel;

	@multiInject(INJECTABLE_TYPES.DomainEntity)
	domainEntities: DomainEntity[];

	buildEntity(document: WikiPageDocument): WikiPage {
		const name = document.type;
		for (let entity of this.domainEntities) {
			if(entity.type === name) {
				return entity.factory(document) as WikiPage;
			}
		}
	}
}
