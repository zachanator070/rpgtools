import { EntityAuthorizationRuleset, WikiFolderRepository } from "../../types";
import { SecurityContext } from "../security-context";
import {
	FOLDER_ADMIN,
	FOLDER_ADMIN_ALL,
	FOLDER_READ,
	FOLDER_READ_ALL,
	FOLDER_READ_ALL_CHILDREN,
	FOLDER_RW,
	FOLDER_RW_ALL,
	FOLDER_RW_ALL_CHILDREN,
} from "../../../../common/src/permission-constants";
import { WikiFolder } from "../../domain-entities/wiki-folder";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import { FilterCondition } from "../../dal/filter-condition";

@injectable()
export class WikiFolderAuthorizationRuleset
	implements EntityAuthorizationRuleset<WikiFolder, WikiFolder>
{
	@inject(INJECTABLE_TYPES.WikiFolderRepository)
	wikiFolderRepository: WikiFolderRepository;

	canAdmin = async (context: SecurityContext, entity: WikiFolder): Promise<boolean> =>
		(await context.hasPermission(FOLDER_ADMIN, entity._id)) ||
		(await context.hasPermission(FOLDER_ADMIN_ALL, entity.world));

	canCreate = async (context: SecurityContext, entity: WikiFolder): Promise<boolean> => {
		return this.canWrite(context, entity);
	};

	canRead = async (context: SecurityContext, entity: WikiFolder): Promise<boolean> => {
		const parentFolder = await this.wikiFolderRepository.findOne([
			new FilterCondition("children", entity._id),
		]);
		let parentReadAll = false;
		if (parentFolder) {
			parentReadAll = await context.hasPermission(FOLDER_READ_ALL_CHILDREN, parentFolder._id);
		}
		return (
			parentReadAll ||
			(await context.hasPermission(FOLDER_READ, entity._id)) ||
			(await context.hasPermission(FOLDER_READ_ALL, entity.world)) ||
			(await this.canWrite(context, entity))
		);
	};

	canWrite = async (context: SecurityContext, entity: WikiFolder): Promise<boolean> => {
		const parentFolder = await this.wikiFolderRepository.findOne([
			new FilterCondition("children", entity._id),
		]);
		let parentWriteAll = false;
		if (parentFolder) {
			parentWriteAll = context.hasPermission(FOLDER_RW_ALL_CHILDREN, parentFolder._id);
		}
		return (
			parentWriteAll ||
			(await context.hasPermission(FOLDER_RW, entity._id)) ||
			(await context.hasPermission(FOLDER_RW_ALL, entity.world))
		);
	};
}
