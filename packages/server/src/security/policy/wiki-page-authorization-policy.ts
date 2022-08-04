import { EntityAuthorizationPolicy, Repository } from "../../types";
import { WikiPage } from "../../domain-entities/wiki-page";
import { SecurityContext } from "../security-context";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import { World } from "../../domain-entities/world";
import { FilterCondition } from "../../dal/filter-condition";
import {
	FOLDER_READ_ALL_PAGES,
	FOLDER_RW_ALL_PAGES,
	WIKI_ADMIN,
	WIKI_ADMIN_ALL,
	WIKI_READ,
	WIKI_READ_ALL,
	WIKI_RW,
	WIKI_RW_ALL,
} from "@rpgtools/common/src/permission-constants";
import { WikiFolder } from "../../domain-entities/wiki-folder";

@injectable()
export class WikiPageAuthorizationPolicy
	implements EntityAuthorizationPolicy<WikiPage>
{
	@inject(INJECTABLE_TYPES.WorldRepository)
	worldRepository: Repository<World>;

	@inject(INJECTABLE_TYPES.WikiFolderRepository)
	wikiFolderRepository: Repository<WikiFolder>;

	entity: WikiPage;

	canAdmin = async (context: SecurityContext): Promise<boolean> => {
		return (
			context.hasPermission(WIKI_ADMIN, this.entity._id) ||
			context.hasPermission(WIKI_ADMIN_ALL, this.entity.world)
		);
	};

	canCreate = async (context: SecurityContext): Promise<boolean> => {
		const parentFolder = await this.wikiFolderRepository.findOne([
			new FilterCondition("pages", this.entity._id),
		]);
		if (!parentFolder) {
			return false;
		}
		return parentFolder.authorizationPolicy.canWrite(context);
	};

	canRead = async (context: SecurityContext): Promise<boolean> => {
		// if this wiki page is the main page of a world
		let world = await this.worldRepository.findOne([new FilterCondition("wikiPage", this.entity._id)]);
		if (world) {
			return world.authorizationPolicy.canRead(context);
		} else {
			world = await this.worldRepository.findById(this.entity.world);
		}
		const parentFolder = await this.wikiFolderRepository.findOne([
			new FilterCondition("pages", this.entity._id),
		]);
		return (
			context.hasPermission(FOLDER_READ_ALL_PAGES, parentFolder._id) ||
			context.hasPermission(WIKI_READ, this.entity._id) ||
			context.hasPermission(WIKI_READ_ALL, world._id) ||
			(await this.canWrite(context))
		);
	};

	canWrite = async (context: SecurityContext): Promise<boolean> => {
		const parentFolder = await this.wikiFolderRepository.findOne([
			new FilterCondition("pages", this.entity._id),
		]);
		return (
			context.hasPermission(FOLDER_RW_ALL_PAGES, parentFolder._id) ||
			context.hasPermission(WIKI_RW, this.entity._id) ||
			context.hasPermission(WIKI_RW_ALL, this.entity.world)
		);
	};
}
