import { WikiPage } from "./wiki-page.js";
import { ARTICLE } from "@rpgtools/common/src/type-constants";
import {inject, injectable} from "inversify";
import {DomainEntity, EntityFactory, RepositoryAccessor} from "../types";
import {INJECTABLE_TYPES} from "../di/injectable-types.js";
import {Repository} from "../dal/repository/repository.js";
import {WikiPageAuthorizationPolicy} from "../security/policy/wiki-page-authorization-policy.js";
import WikiPageModel from "../dal/sql/models/wiki-page-model.js";

@injectable()
export class Article extends WikiPage {

	factory: EntityFactory<Article, WikiPageModel>

	constructor(
		@inject(INJECTABLE_TYPES.ArticleFactory)
		factory: EntityFactory<Article, WikiPageModel>,
		@inject(INJECTABLE_TYPES.WikiPageAuthorizationPolicy)
		authorizationPolicy: WikiPageAuthorizationPolicy
	) {
		super(authorizationPolicy);
		this.factory = factory;
	}

	type: string = ARTICLE;
	getRepository(accessor: RepositoryAccessor): Repository<DomainEntity> {
		return accessor.articleRepository;
	}

}
