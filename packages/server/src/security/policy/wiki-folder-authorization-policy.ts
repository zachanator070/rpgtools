import { EntityAuthorizationPolicy, WikiFolderRepository } from "../../types";
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
} from "@rpgtools/common/src/permission-constants";
import { WikiFolder } from "../../domain-entities/wiki-folder";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import { FilterCondition } from "../../dal/filter-condition";

@injectable()
export class WikiFolderAuthorizationPolicy
	implements EntityAuthorizationPolicy<WikiFolder>
{
	@inject(INJECTABLE_TYPES.WikiFolderRepository)
	wikiFolderRepository: WikiFolderRepository;

	entity: WikiFolder;

	canAdmin = async (context: SecurityContext): Promise<boolean> =>
		(await context.hasPermission(FOLDER_ADMIN, this.entity._id)) ||
		(await context.hasPermission(FOLDER_ADMIN_ALL, this.entity.world));

	canCreate = async (context: SecurityContext): Promise<boolean> => {
		return this.canWrite(context);
	};

	canRead = async (context: SecurityContext): Promise<boolean> => {
		const parentFolder = await this.wikiFolderRepository.findOne([
			new FilterCondition("children", this.entity._id),
		]);
		let parentReadAll = false;
		if (parentFolder) {
			parentReadAll = await context.hasPermission(FOLDER_READ_ALL_CHILDREN, parentFolder._id);
		}
		return (
			parentReadAll ||
			(await context.hasPermission(FOLDER_READ, this.entity._id)) ||
			(await context.hasPermission(FOLDER_READ_ALL, this.entity.world)) ||
			(await this.canWrite(context))
		);
	};

	canWrite = async (context: SecurityContext): Promise<boolean> => {
		const parentFolder = await this.wikiFolderRepository.findOne([
			new FilterCondition("children", this.entity._id),
		]);
		let parentWriteAll = false;
		if (parentFolder) {
			parentWriteAll = context.hasPermission(FOLDER_RW_ALL_CHILDREN, parentFolder._id);
		}
		return (
			parentWriteAll ||
			(await context.hasPermission(FOLDER_RW, this.entity._id)) ||
			(await context.hasPermission(FOLDER_RW_ALL, this.entity.world))
		);
	};
}
