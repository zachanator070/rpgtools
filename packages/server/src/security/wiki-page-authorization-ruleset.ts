import { EntityAuthorizationRuleset, Repository } from "../types";
import { WikiPage } from "../domain-entities/wiki-page";
import { SecurityContext } from "../security-context";
import { inject } from "inversify";
import { INJECTABLE_TYPES } from "../injectable-types";
import { World } from "../domain-entities/world";
import { FilterCondition } from "../dal/filter-condition";
import {
	FOLDER_READ_ALL_PAGES,
	FOLDER_RW_ALL_PAGES,
	WIKI_ADMIN,
	WIKI_ADMIN_ALL,
	WIKI_READ,
	WIKI_READ_ALL,
	WIKI_RW,
	WIKI_RW_ALL,
} from "../../../common/src/permission-constants";
import { WikiFolder } from "../domain-entities/wiki-folder";

export class WikiPageAuthorizationRuleset implements EntityAuthorizationRuleset<WikiPage> {
	@inject(INJECTABLE_TYPES.WorldRepository)
	worldRepository: Repository<World>;

	@inject(INJECTABLE_TYPES.WikiFolderRepository)
	wikiFolderRepository: Repository<WikiFolder>;

	wikiFolderAuthorizationRuleset: EntityAuthorizationRuleset<WikiPage> = new WikiPageAuthorizationRuleset();

	canAdmin = async (context: SecurityContext, entity: WikiPage): Promise<boolean> => {
		return (
			context.hasPermission(WIKI_ADMIN, entity._id) ||
			context.hasPermission(WIKI_ADMIN_ALL, entity.world)
		);
	};

	canCreate = async (context: SecurityContext, entity: WikiFolder): Promise<boolean> => {
		return this.wikiFolderAuthorizationRuleset.canWrite(context, entity);
	};

	canRead = async (context: SecurityContext, entity: WikiPage): Promise<boolean> => {
		// if this wiki page is the main page of a world
		const world = await this.worldRepository.findOne([new FilterCondition("wikiPage", entity._id)]);
		if (world) {
			return true;
		}
		const parentFolder = await this.wikiFolderRepository.findOne([
			new FilterCondition("pages", entity._id),
		]);
		return (
			context.hasPermission(FOLDER_READ_ALL_PAGES, parentFolder._id) ||
			context.hasPermission(WIKI_READ, entity._id) ||
			context.hasPermission(WIKI_READ_ALL, world._id) ||
			(await this.canWrite(context, entity))
		);
	};

	canWrite = async (context: SecurityContext, entity: WikiPage): Promise<boolean> => {
		const parentFolder = await this.wikiFolderRepository.findOne([
			new FilterCondition("pages", entity._id),
		]);
		return (
			context.hasPermission(FOLDER_RW_ALL_PAGES, parentFolder._id) ||
			context.hasPermission(WIKI_RW, entity._id) ||
			context.hasPermission(WIKI_RW_ALL, entity.world)
		);
	};
}
