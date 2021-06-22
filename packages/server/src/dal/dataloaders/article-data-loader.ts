import { GraphqlDataloader } from "../graphql-dataloader";
import { Article } from "../../domain-entities/article";
import { inject } from "inversify";
import { INJECTABLE_TYPES } from "../../injectable-types";
import { ArticleAuthorizationRuleset } from "../../security/article-authorization-ruleset";
import { ArticleRepository } from "../../types";

export class ArticleDataLoader extends GraphqlDataloader<Article> {
	constructor(@inject(INJECTABLE_TYPES.ArticleRepository) articleRepository: ArticleRepository) {
		super(articleRepository, new ArticleAuthorizationRuleset());
	}
}
