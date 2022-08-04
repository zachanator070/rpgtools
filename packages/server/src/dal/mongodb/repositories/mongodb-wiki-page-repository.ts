import {inject, injectable, multiInject} from "inversify";
import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import {
	DomainEntity,
	ItemDocument,
	MonsterDocument,
	PersonDocument,
	PlaceDocument,
	WikiPageDocument,
	WikiPageRepository,
} from "../../../types";
import mongoose from "mongoose";
import { WikiPage } from "../../../domain-entities/wiki-page";
import { WikiPageModel } from "../models/wiki-page";
import { ARTICLE, ITEM, MONSTER, PERSON, PLACE } from "@rpgtools/common/src/type-constants";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";
import { MongodbArticleRepository } from "./mongodb-article-repository";
import { MongodbPersonRepository } from "./mongodb-person-repository";
import { MongodbPlaceRepository } from "./mongodb-place-repository";
import { MongodbMonsterRepository } from "./mongodb-monster-repository";
import { MongodbItemRepository } from "./mongodb-item-repository";
import { ArticleDocument } from "../models/article";

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
