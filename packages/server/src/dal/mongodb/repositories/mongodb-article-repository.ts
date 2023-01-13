import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Article } from "../../../domain-entities/article";
import { ArticleDocument, ArticleModel } from "../models/article";
import mongoose from "mongoose";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";
import {ArticleRepository} from "../../repository/article-repository";
import {FilterCondition} from "../../filter-condition";
import ArticleFactory from "../../../domain-entities/factory/article-factory";

@injectable()
export class MongodbArticleRepository
	extends AbstractMongodbRepository<Article, ArticleDocument>
	implements ArticleRepository
{
	@inject(INJECTABLE_TYPES.ArticleFactory)
	entityFactory: ArticleFactory;

	model: mongoose.Model<any> = ArticleModel;

	findOneByNameAndWorld(name: string, worldId: string): Promise<Article> {
		return this.findOne([
			new FilterCondition("name", name),
			new FilterCondition("world", worldId),
		]);
	}
}
