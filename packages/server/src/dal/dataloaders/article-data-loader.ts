import { GraphqlDataloader } from "../graphql-dataloader";
import { Article } from "../../domain-entities/article";
import { injectable } from "inversify";
import {Repository} from "../repository/repository";
import {DatabaseContext} from "../database-context";

@injectable()
export class ArticleDataLoader extends GraphqlDataloader<Article> {
	getRepository(databaseContext: DatabaseContext): Repository<Article> {
		return databaseContext.articleRepository;
	}

}
