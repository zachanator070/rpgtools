import {inject, injectable, multiInject} from "inversify";
import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import {
	DomainEntity,
	WikiPageDocument,
} from "../../../types";
import mongoose from "mongoose";
import { WikiPage } from "../../../domain-entities/wiki-page";
import { WikiPageModel } from "../models/wiki-page";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";
import {WikiPageRepository} from "../../repository/wiki-page-repository";
import {PaginatedResult} from "../../paginated-result";
import {FILTER_CONDITION_OPERATOR_IN, FILTER_CONDITION_REGEX, FilterCondition} from "../../filter-condition";
import WikiPageFactory from "../../../domain-entities/factory/wiki-page-factory";
import {EVENT_WIKI} from "@rpgtools/common/src/type-constants";


@injectable()
export class MongodbWikiPageRepository
	extends AbstractMongodbRepository<WikiPage, WikiPageDocument>
	implements WikiPageRepository
{
	@inject(INJECTABLE_TYPES.WikiPageFactory)
	entityFactory: WikiPageFactory;

	model: mongoose.Model<any> = WikiPageModel;

	@multiInject(INJECTABLE_TYPES.DomainEntity)
	domainEntities: DomainEntity[];

	findByIdsPaginated(ids: string[], page: number, sort?: string): Promise<PaginatedResult<WikiPage>> {
		return this.findPaginated([new FilterCondition('_id', ids, FILTER_CONDITION_OPERATOR_IN)], page, sort);
	}

	findByNameAndTypesPaginatedSortByName(page: number, name?: string, types?: string[]): Promise<PaginatedResult<WikiPage>> {
		const conditions = [];
		if(name) {
			conditions.push(new FilterCondition('name', name, FILTER_CONDITION_REGEX));
		}
		if(types && types.length > 0){
			conditions.push(new FilterCondition('type', types, FILTER_CONDITION_OPERATOR_IN));
		}
		return this.findPaginated(conditions, page, 'name');
	}

	findOneByNameAndWorld(name: string, worldId: string): Promise<WikiPage> {
		return this.findOne([
			new FilterCondition("name", name),
			new FilterCondition("world", worldId),
		]);
	}

}
