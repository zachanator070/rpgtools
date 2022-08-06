import {EntityAuthorizationPolicy, UnitOfWork} from "../../types";
import { WikiPage } from "../../domain-entities/wiki-page";
import { SecurityContext } from "../security-context";
import {injectable } from "inversify";
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

@injectable()
export class WikiPageAuthorizationPolicy
	implements EntityAuthorizationPolicy<WikiPage>
{

	entity: WikiPage;

	canAdmin = async (context: SecurityContext): Promise<boolean> => {
		return (
			context.hasPermission(WIKI_ADMIN, this.entity._id) ||
			context.hasPermission(WIKI_ADMIN_ALL, this.entity.world)
		);
	};

	canCreate = async (context: SecurityContext, unitOfWork: UnitOfWork): Promise<boolean> => {
		const parentFolder = await unitOfWork.wikiFolderRepository.findOne([
			new FilterCondition("pages", this.entity._id),
		]);
		if (!parentFolder) {
			return false;
		}
		return parentFolder.authorizationPolicy.canWrite(context, unitOfWork);
	};

	canRead = async (context: SecurityContext, unitOfWork: UnitOfWork): Promise<boolean> => {
		// if this wiki page is the main page of a world
		let world = await unitOfWork.worldRepository.findOne([new FilterCondition("wikiPage", this.entity._id)]);
		if (world) {
			return world.authorizationPolicy.canRead(context, unitOfWork);
		} else {
			world = await unitOfWork.worldRepository.findById(this.entity.world);
		}
		const parentFolder = await unitOfWork.wikiFolderRepository.findOne([
			new FilterCondition("pages", this.entity._id),
		]);
		return (
			context.hasPermission(FOLDER_READ_ALL_PAGES, parentFolder._id) ||
			context.hasPermission(WIKI_READ, this.entity._id) ||
			context.hasPermission(WIKI_READ_ALL, world._id) ||
			(await this.canWrite(context, unitOfWork))
		);
	};

	canWrite = async (context: SecurityContext, unitOfWork: UnitOfWork): Promise<boolean> => {
		const parentFolder = await unitOfWork.wikiFolderRepository.findOne([
			new FilterCondition("pages", this.entity._id),
		]);
		return (
			context.hasPermission(FOLDER_RW_ALL_PAGES, parentFolder._id) ||
			context.hasPermission(WIKI_RW, this.entity._id) ||
			context.hasPermission(WIKI_RW_ALL, this.entity.world)
		);
	};
}
