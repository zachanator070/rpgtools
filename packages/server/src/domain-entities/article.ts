import { WikiPage } from "./wiki-page";
import { ARTICLE } from "@rpgtools/common/src/type-constants";
import {inject, injectable} from "inversify";
import {DomainEntity, EntityFactory, RepositoryAccessor} from "../types";
import {INJECTABLE_TYPES} from "../di/injectable-types";
import {Repository} from "../dal/repository/repository";
import {WikiPageAuthorizationPolicy} from "../security/policy/wiki-page-authorization-policy";
import WikiPageModel from "../dal/sql/models/wiki-page-model";

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
