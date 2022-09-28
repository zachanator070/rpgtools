import { WikiPage } from "./wiki-page";
import { ARTICLE } from "@rpgtools/common/src/type-constants";
import {inject, injectable} from "inversify";
import {DomainEntity, EntityFactory, RepositoryAccessor} from "../types";
import {INJECTABLE_TYPES} from "../di/injectable-types";
import {Repository} from "../dal/repository/repository";
import {WikiPageAuthorizationPolicy} from "../security/policy/wiki-page-authorization-policy";
import {ArticleDocument} from "../dal/mongodb/models/article";

@injectable()
export class Article extends WikiPage {

	factory: EntityFactory<Article, ArticleDocument>

	constructor(
		@inject(INJECTABLE_TYPES.ArticleFactory)
		factory: EntityFactory<Article, ArticleDocument>,
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
