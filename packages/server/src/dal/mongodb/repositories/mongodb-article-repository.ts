import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Article } from "../../../domain-entities/article";
import { ArticleRepository } from "../../../types";
import { ArticleDocument, ArticleModel } from "../models/article";
import { Model } from "mongoose";
import { injectable } from "inversify";

@injectable()
export class MongodbArticleRepository
	extends AbstractMongodbRepository<Article, ArticleDocument>
	implements ArticleRepository
{
	model: Model<any> = ArticleModel;

	buildEntity(document: ArticleDocument): Article {
		return new Article(
			document._id.toString(),
			document.name,
			document.world.toString(),
			document.coverImage ? document.coverImage.toString() : null,
			document.contentId ? document.contentId.toString() : null
		);
	}
}
