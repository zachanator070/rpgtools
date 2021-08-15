import { inject, injectable } from "inversify";
import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import {
	ItemDocument,
	MonsterDocument,
	PersonDocument,
	PlaceDocument,
	WikiPageDocument,
	WikiPageRepository,
} from "../../../types";
import { Model } from "mongoose";
import { WikiPage } from "../../../domain-entities/wiki-page";
import { WikiPageModel } from "../models/wiki-page";
import { ARTICLE, ITEM, MONSTER, PERSON, PLACE } from "../../../../../common/src/type-constants";
import { INJECTABLE_TYPES } from "../../../injectable-types";
import { MongodbArticleRepository } from "./mongodb-article-repository";
import { MongodbPersonRepository } from "./mongodb-person-repository";
import { MongodbPlaceRepository } from "./mongodb-place-repository";
import { MongodbMonsterRepository } from "./mongodb-monster-repository";
import { MongodbItemRepository } from "./mongodb-item-repository";
import {ArticleDocument} from "../models/article";

@injectable()
export class MongodbWikiPageRepository
	extends AbstractMongodbRepository<WikiPage, WikiPageDocument>
	implements WikiPageRepository
{
	model: Model<any> = WikiPageModel;

	@inject(INJECTABLE_TYPES.ArticleRepository)
	articleRepository: MongodbArticleRepository;
	@inject(INJECTABLE_TYPES.PlaceRepository)
	placeRepository: MongodbPlaceRepository;
	@inject(INJECTABLE_TYPES.PersonRepository)
	personRepository: MongodbPersonRepository;
	@inject(INJECTABLE_TYPES.ItemRepository)
	itemRepository: MongodbItemRepository;
	@inject(INJECTABLE_TYPES.MonsterRepository)
	monsterRepository: MongodbMonsterRepository;

	buildEntity(document: WikiPageDocument): WikiPage {
		const name = document.type;
		switch (name) {
			case ARTICLE:
				const articleDocument = document as ArticleDocument;
				return this.articleRepository.buildEntity(articleDocument);
			case PLACE:
				const placeDocument = document as PlaceDocument;
				return this.placeRepository.buildEntity(placeDocument);
			case PERSON:
				const personDocument = document as PersonDocument;
				return this.personRepository.buildEntity(personDocument);
			case ITEM:
				const itemDocument = document as ItemDocument;
				return this.itemRepository.buildEntity(itemDocument);
			case MONSTER:
				const monsterDocument = document as MonsterDocument;
				return this.monsterRepository.buildEntity(monsterDocument);
			default:
				throw new Error(`Unknown wiki page type received from the database: ${name}`);
		}
	}
}
