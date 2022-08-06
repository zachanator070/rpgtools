import {EntityAuthorizationPolicy, UnitOfWork} from "../../types";
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
import { injectable } from "inversify";
import { FilterCondition } from "../../dal/filter-condition";

@injectable()
export class WikiFolderAuthorizationPolicy
	implements EntityAuthorizationPolicy<WikiFolder>
{

	entity: WikiFolder;

	canAdmin = async (context: SecurityContext): Promise<boolean> =>
		(await context.hasPermission(FOLDER_ADMIN, this.entity._id)) ||
		(await context.hasPermission(FOLDER_ADMIN_ALL, this.entity.world));

	canCreate = async (context: SecurityContext, unitOfWork: UnitOfWork): Promise<boolean> => {
		return this.canWrite(context, unitOfWork);
	};

	canRead = async (context: SecurityContext, unitOfWork: UnitOfWork): Promise<boolean> => {
		const parentFolder = await unitOfWork.wikiFolderRepository.findOne([
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
			(await this.canWrite(context, unitOfWork))
		);
	};

	canWrite = async (context: SecurityContext, unitOfWork: UnitOfWork): Promise<boolean> => {
		const parentFolder = await unitOfWork.wikiFolderRepository.findOne([
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
