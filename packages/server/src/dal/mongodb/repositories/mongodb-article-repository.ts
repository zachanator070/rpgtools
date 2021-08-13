import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Article } from "../../../domain-entities/article";
import { ArticleDocument, ArticleFactory, ArticleRepository } from "../../../types";
import { ArticleModel } from "../models/article";
import { Model } from "mongoose";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../../injectable-types";

@injectable()
export class MongodbArticleRepository
	extends AbstractMongodbRepository<Article, ArticleDocument>
	implements ArticleRepository
{
	@inject(INJECTABLE_TYPES.ArticleFactory)
	articleFactory: ArticleFactory;

	model: Model<any> = ArticleModel;

	buildEntity(document: ArticleDocument): Article {
		return this.articleFactory(
			document._id.toString(),
			document.name,
			document.world.toString(),
			document.coverImage ? document.coverImage.toString() : null,
			document.contentId ? document.contentId.toString() : null
		);
	}
}
