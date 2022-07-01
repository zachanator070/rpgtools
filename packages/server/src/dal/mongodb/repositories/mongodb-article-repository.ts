import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Article } from "../../../domain-entities/article";
import { ArticleFactory, ArticleRepository } from "../../../types";
import { ArticleDocument, ArticleModel } from "../models/article";
import mongoose from "mongoose";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";

@injectable()
export class MongodbArticleRepository
	extends AbstractMongodbRepository<Article, ArticleDocument>
	implements ArticleRepository
{
	@inject(INJECTABLE_TYPES.ArticleFactory)
	articleFactory: ArticleFactory;

	model: mongoose.Model<any> = ArticleModel;

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
