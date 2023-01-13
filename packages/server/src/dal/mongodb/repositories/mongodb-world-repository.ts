import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { World } from "../../../domain-entities/world";
import { inject, injectable } from "inversify";
import mongoose from "mongoose";
import {WorldDocument, WorldModel} from "../models/world";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";
import {WorldRepository} from "../../repository/world-repository";
import {PaginatedResult} from "../../paginated-result";
import {FILTER_CONDITION_REGEX, FilterCondition} from "../../filter-condition";
import WorldFactory from "../../../domain-entities/factory/world-factory";

@injectable()
export class MongodbWorldRepository
	extends AbstractMongodbRepository<World, WorldDocument>
	implements WorldRepository
{
	@inject(INJECTABLE_TYPES.WorldFactory)
	entityFactory: WorldFactory;

	model: mongoose.Model<any> = WorldModel;

	findAllPaginated(page: number): Promise<PaginatedResult<World>> {
		return this.findPaginated([], page);
	}

	findByNamePaginated(name: string, page: number): Promise<PaginatedResult<World>> {
		return this.findPaginated([new FilterCondition("name", name, FILTER_CONDITION_REGEX)], page);
	}

	findOneByWikiPage(pageId: string): Promise<World> {
		return this.findOne([
			new FilterCondition("wikiPage", pageId),
		]);
	}

	findByRootFolder(folderId: string): Promise<World[]> {
		return this.find([
			new FilterCondition("rootFolder", folderId),
		]);
	}
}
