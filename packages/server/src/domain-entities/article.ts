import { WikiPage } from "./wiki-page";
import { ARTICLE } from "@rpgtools/common/src/type-constants";
import {inject, injectable} from "inversify";
import {ArticleFactory, DomainEntity, Factory, Repository, UnitOfWork} from "../types";
import {INJECTABLE_TYPES} from "../di/injectable-types";

@injectable()
export class Article extends WikiPage {

	@inject(INJECTABLE_TYPES.ArticleFactory)
	factory: ArticleFactory

	type: string = ARTICLE;
	getRepository(unitOfWork: UnitOfWork): Repository<DomainEntity> {
		return unitOfWork.articleRepository;
	}
}
