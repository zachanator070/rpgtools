import { WikiPage } from "./wiki-page";
import { ARTICLE } from "@rpgtools/common/src/type-constants";
import {inject, injectable} from "inversify";
import {ArticleFactory, DomainEntity, RepositoryAccessor, UnitOfWork} from "../types";
import {INJECTABLE_TYPES} from "../di/injectable-types";
import {Repository} from "../dal/repository/repository";

@injectable()
export class Article extends WikiPage {

	@inject(INJECTABLE_TYPES.ArticleFactory)
	factory: ArticleFactory

	type: string = ARTICLE;
	getRepository(accessor: RepositoryAccessor): Repository<DomainEntity> {
		return accessor.articleRepository;
	}
}
