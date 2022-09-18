import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { World } from "../../../domain-entities/world";
import { inject, injectable } from "inversify";
import { WorldFactory} from "../../../types";
import mongoose from "mongoose";
import {WorldDocument, WorldModel} from "../models/world";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";
import AclFactory from "./acl-factory";
import {WorldRepository} from "../../repository/world-repository";
import {PaginatedResult} from "../../paginated-result";
import {FILTER_CONDITION_REGEX, FilterCondition} from "../../filter-condition";

@injectable()
export class MongodbWorldRepository
	extends AbstractMongodbRepository<World, WorldDocument>
	implements WorldRepository
{
	@inject(INJECTABLE_TYPES.WorldFactory)
	worldFactory: WorldFactory;

	model: mongoose.Model<any> = WorldModel;

	buildEntity(document: WorldDocument): World {
		return this.worldFactory(
			{
				_id: document._id.toString(),
				name: document.name,
				wikiPage: document.wikiPage?.toString(),
				rootFolder: document.rootFolder?.toString(),
				acl: AclFactory(document.acl)
			}
		);
	}

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
