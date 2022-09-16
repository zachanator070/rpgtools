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

	canAdmin = async (context: SecurityContext, unitOfWork: UnitOfWork): Promise<boolean> => {
		const world = await unitOfWork.worldRepository.findById(this.entity.world);
		return context.hasPermission(FOLDER_ADMIN, this.entity) ||
		context.hasPermission(FOLDER_ADMIN_ALL, world);
	}

	canCreate = async (context: SecurityContext, unitOfWork: UnitOfWork): Promise<boolean> => {
		const parentFolder = await unitOfWork.wikiFolderRepository.findOne([
			new FilterCondition("children", this.entity._id),
		]);
		if (!parentFolder) {
			return false;
		}
		return parentFolder.authorizationPolicy.canWrite(context, unitOfWork);
	};

	canRead = async (context: SecurityContext, unitOfWork: UnitOfWork): Promise<boolean> => {
		const world = await unitOfWork.worldRepository.findById(this.entity.world);
		const parentFolder = await unitOfWork.wikiFolderRepository.findOne([
			new FilterCondition("children", this.entity._id),
		]);
		let parentReadAll = false;
		if (parentFolder) {
			parentReadAll = context.hasPermission(FOLDER_READ_ALL_CHILDREN, parentFolder);
		}
		return (
			parentReadAll ||
			context.hasPermission(FOLDER_READ, this.entity) ||
			 context.hasPermission(FOLDER_READ_ALL, world) ||
			await this.canWrite(context, unitOfWork)
		);
	};

	canWrite = async (context: SecurityContext, unitOfWork: UnitOfWork): Promise<boolean> => {
		const parentFolder = await unitOfWork.wikiFolderRepository.findOne([
			new FilterCondition("children", this.entity._id),
		]);
		let parentWriteAll = false;
		if (parentFolder) {
			parentWriteAll = context.hasPermission(FOLDER_RW_ALL_CHILDREN, parentFolder);
		}
		const world = await unitOfWork.worldRepository.findById(this.entity.world);
		return (
			parentWriteAll ||
			context.hasPermission(FOLDER_RW, this.entity) ||
			context.hasPermission(FOLDER_RW_ALL, world)
		);
	};
}
