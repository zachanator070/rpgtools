import { GraphqlDataloader } from "../graphql-dataloader";
import { Article } from "../../domain-entities/article";
import { injectable } from "inversify";
import {UnitOfWork} from "../../types";
import {Repository} from "../repository/repository";

@injectable()
export class ArticleDataLoader extends GraphqlDataloader<Article> {
	getRepository(unitOfWork: UnitOfWork): Repository<Article> {
		return unitOfWork.articleRepository;
	}

}
