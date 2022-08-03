import { WikiPage } from "./wiki-page";
import { ARTICLE } from "@rpgtools/common/src/type-constants";
import { injectable } from "inversify";
import {DomainEntity, Repository, UnitOfWork} from "../types";

@injectable()
export class Article extends WikiPage {
	type: string = ARTICLE;
	getRepository(unitOfWork: UnitOfWork): Repository<DomainEntity> {
		return unitOfWork.articleRepository;
	}
}
