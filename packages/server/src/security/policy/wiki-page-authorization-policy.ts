import {EntityAuthorizationPolicy} from "../../types";
import { WikiPage } from "../../domain-entities/wiki-page.js";
import { SecurityContext } from "../security-context.js";
import {injectable } from "inversify";
import {
	FOLDER_READ_ALL_PAGES,
	FOLDER_RW_ALL_PAGES,
	WIKI_ADMIN,
	WIKI_ADMIN_ALL,
	WIKI_READ,
	WIKI_READ_ALL,
	WIKI_RW,
	WIKI_RW_ALL,
} from "@rpgtools/common/src/permission-constants.js";
import {DatabaseContext} from "../../dal/database-context.js";

@injectable()
export class WikiPageAuthorizationPolicy implements EntityAuthorizationPolicy
{

	entity: WikiPage;

	canAdmin = async (context: SecurityContext, databaseContext: DatabaseContext): Promise<boolean> => {
		const world = await databaseContext.worldRepository.findOneById(this.entity.world);
		return (
			context.hasPermission(WIKI_ADMIN, this.entity) ||
			context.hasPermission(WIKI_ADMIN_ALL, world)
		);
	};

	canCreate = async (context: SecurityContext, databaseContext: DatabaseContext): Promise<boolean> => {
		const parentFolder = await databaseContext.wikiFolderRepository.findOneWithPage(this.entity._id);
		if (!parentFolder) {
			return false;
		}
		return parentFolder.authorizationPolicy.canWrite(context, databaseContext);
	};

	canRead = async (context: SecurityContext, databaseContext: DatabaseContext): Promise<boolean> => {
		// if this wiki page is the main page of a world
		let world = await databaseContext.worldRepository.findOneByWikiPage(this.entity._id);
		if (world) {
			return world.authorizationPolicy.canRead(context, databaseContext);
		} else {
			world = await databaseContext.worldRepository.findOneById(this.entity.world);
		}
		const parentFolder = await databaseContext.wikiFolderRepository.findOneWithPage(this.entity._id);
		return (
			context.hasPermission(FOLDER_READ_ALL_PAGES, parentFolder) ||
			context.hasPermission(WIKI_READ, this.entity) ||
			context.hasPermission(WIKI_READ_ALL, world) ||
			(await this.canWrite(context, databaseContext))
		);
	};

	canWrite = async (context: SecurityContext, databaseContext: DatabaseContext): Promise<boolean> => {
		const parentFolder = await databaseContext.wikiFolderRepository.findOneWithPage(this.entity._id);
		const world = await databaseContext.worldRepository.findOneById(this.entity.world);
		return (
			context.hasPermission(FOLDER_RW_ALL_PAGES, parentFolder) ||
			context.hasPermission(WIKI_RW, this.entity) ||
			context.hasPermission(WIKI_RW_ALL, world)
		);
	};
}
