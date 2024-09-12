import { GraphqlDataloader } from "../graphql-dataloader.js";
import { Article } from "../../domain-entities/article.js";
import { injectable } from "inversify";
import {Repository} from "../repository/repository.js";
import {DatabaseContext} from "../database-context.js";

@injectable()
export class ArticleDataLoader extends GraphqlDataloader<Article> {
	getRepository(databaseContext: DatabaseContext): Repository<Article> {
		return databaseContext.articleRepository;
	}

}
