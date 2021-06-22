import { injectable } from "inversify";
import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { WikiPageRepository } from "../../../types";
import { Model } from "mongoose";
import { WikiPage } from "../../../domain-entities/wiki-page";
import { WikiPageDocument, WikiPageModel } from "../models/wiki-page";
import { ARTICLE, ITEM, MONSTER, PERSON, PLACE } from "../../../../../common/src/type-constants";
import { Article } from "../../../domain-entities/article";
import { Place } from "../../../domain-entities/place";
import { PlaceDocument } from "../models/place";
import { PersonDocument } from "../models/person";
import { ItemDocument } from "../models/item";
import { MonsterDocument } from "../models/monster";
import { Person } from "../../../domain-entities/person";
import { Item } from "../../../domain-entities/item";
import { Monster } from "../../../domain-entities/monster";

@injectable()
export class MongodbWikiPageRepository
	extends AbstractMongodbRepository<WikiPage, WikiPageDocument>
	implements WikiPageRepository {
	model: Model<any> = WikiPageModel;

	buildEntity(document: WikiPageDocument): WikiPage {
		const name = document.modelName;
		switch (name) {
			case ARTICLE:
				return new Article(
					document._id.toString(),
					document.name,
					document.world.toString(),
					document.coverImage.toString(),
					document.contentId.toString()
				);
			case PLACE:
				const placeDocument = document as PlaceDocument;
				return new Place(
					placeDocument._id.toString(),
					placeDocument.name,
					placeDocument.world.toString(),
					placeDocument.coverImage.toString(),
					placeDocument.contentId.toString(),
					placeDocument.mapImage.toString(),
					placeDocument.pixelsPerFoot
				);
			case PERSON:
				const personDocument = document as PersonDocument;
				return new Person(
					personDocument._id.toString(),
					personDocument.name,
					personDocument.world.toString(),
					personDocument.coverImage.toString(),
					personDocument.contentId.toString(),
					personDocument.pageModel.toString(),
					personDocument.modelColor
				);
			case ITEM:
				const itemDocument = document as ItemDocument;
				return new Item(
					itemDocument._id.toString(),
					itemDocument.name,
					itemDocument.world.toString(),
					itemDocument.coverImage.toString(),
					itemDocument.contentId.toString(),
					itemDocument.pageModel.toString(),
					itemDocument.modelColor
				);
			case MONSTER:
				const monsterDocument = document as MonsterDocument;
				return new Monster(
					monsterDocument._id.toString(),
					monsterDocument.name,
					monsterDocument.world.toString(),
					monsterDocument.coverImage.toString(),
					monsterDocument.contentId.toString(),
					monsterDocument.pageModel.toString(),
					monsterDocument.modelColor
				);
			default:
				throw new Error(`Unknown wiki page type received from the database: ${name}`);
		}
	}
}
