import { GraphqlDataloader } from "../graphql-dataloader";
import { Article } from "../../domain-entities/article";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import { ArticleAuthorizationPolicy } from "../../security/policy/article-authorization-policy";
import {ArticleRepository, Repository, UnitOfWork} from "../../types";

@injectable()
export class ArticleDataLoader extends GraphqlDataloader<Article> {
	getRepository(unitOfWork: UnitOfWork): Repository<Article> {
		return unitOfWork.articleRepository;
	}

}
