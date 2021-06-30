import { GraphqlDataloader } from "../graphql-dataloader";
import { Article } from "../../domain-entities/article";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../injectable-types";
import { ArticleAuthorizationRuleset } from "../../security/article-authorization-ruleset";
import { ArticleRepository } from "../../types";

@injectable()
export class ArticleDataLoader extends GraphqlDataloader<Article> {
	constructor(
		@inject(INJECTABLE_TYPES.ArticleRepository) articleRepository: ArticleRepository,
		@inject(INJECTABLE_TYPES.ArticleAuthorizationRuleset)
		articleAuthorizationRuleset: ArticleAuthorizationRuleset
	) {
		super();
		this.repository = articleRepository;
		this.ruleset = articleAuthorizationRuleset;
	}
}
