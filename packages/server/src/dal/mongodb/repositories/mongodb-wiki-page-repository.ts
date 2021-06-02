import { injectable } from "inversify";
import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { WikiPageRepository } from "../../../types";
import { Model } from "mongoose";
import { WikiPage } from "../../../domain-entities/wiki-page";
import { WikiPageDocument, WikiPageModel } from "../models/wiki-page";

@injectable()
export class MongodbWikiPageRepository
	extends AbstractMongodbRepository<WikiPage, WikiPageDocument>
	implements WikiPageRepository {
	model: Model<any> = WikiPageModel;

	buildEntity(document: WikiPageDocument): WikiPage {
		return new WikiPage(
			document._id.toString(),
			document.name,
			document.world.toString(),
			document.coverImage.toString(),
			document.contentId.toString()
		);
	}
}
