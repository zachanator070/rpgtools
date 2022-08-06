import {
	ArticleFactory,
	PermissionAssignmentFactory,
	UnitOfWork,
	WikiFolderFactory,
} from "../types";
import { WikiFolder } from "../domain-entities/wiki-folder";
import { SecurityContext } from "../security/security-context";
import {
	FILTER_CONDITION_OPERATOR_IN,
	FILTER_CONDITION_REGEX,
	FilterCondition,
} from "../dal/filter-condition";
import { FOLDER_ADMIN, FOLDER_RW } from "@rpgtools/common/src/permission-constants";
import { WIKI_FOLDER } from "@rpgtools/common/src/type-constants";
import { World } from "../domain-entities/world";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import {AuthorizationService} from "./authorization-service";

@injectable()
export class WikiFolderService {

	@inject(INJECTABLE_TYPES.AuthorizationService)
	authorizationService: AuthorizationService;

	@inject(INJECTABLE_TYPES.WikiFolderFactory)
	wikiFolderFactory: WikiFolderFactory;
	@inject(INJECTABLE_TYPES.PermissionAssignmentFactory)
	permissionAssignmentFactory: PermissionAssignmentFactory;
	@inject(INJECTABLE_TYPES.ArticleFactory)
	articleFactory: ArticleFactory;

	createFolder = async (
		context: SecurityContext,
		name: string,
		parentFolderId: string,
		unitOfWork: UnitOfWork
	): Promise<World> => {
		const parentFolder = await unitOfWork.wikiFolderRepository.findById(parentFolderId);
		if (!parentFolder) {
			throw new Error("Parent folder does not exist");
		}

		if (!(await parentFolder.authorizationPolicy.canWrite(context, unitOfWork))) {
			throw new Error(`You do not have permission for this folder`);
		}
		const newFolder = this.wikiFolderFactory({_id: null, name, world: parentFolder.world, pages: [], children: []});
		await unitOfWork.wikiFolderRepository.create(newFolder);
		parentFolder.children.push(newFolder._id);
		await unitOfWork.wikiFolderRepository.update(parentFolder);

		for (let permission of [FOLDER_RW, FOLDER_ADMIN]) {
			const newPermission = this.permissionAssignmentFactory(
				{
					_id: null,
					permission,
					subject: newFolder._id,
					subjectType: WIKI_FOLDER
				}
			);
			await unitOfWork.permissionAssignmentRepository.create(newPermission);
			context.user.permissions.push(newPermission._id);
		}
		await unitOfWork.userRepository.update(context.user);
		return unitOfWork.worldRepository.findById(newFolder.world);
	};

	renameFolder = async (
		context: SecurityContext,
		folderId: string,
		name: string,
		unitOfWork: UnitOfWork
	): Promise<WikiFolder> => {
		const folder = await unitOfWork.wikiFolderRepository.findById(folderId);
		if (!folder) {
			throw new Error("Folder does not exist");
		}
		if (!(await folder.authorizationPolicy.canWrite(context, unitOfWork))) {
			throw new Error(`You do not have permission for this folder`);
		}

		folder.name = name;
		await unitOfWork.wikiFolderRepository.update(folder);
		return folder;
	};

	deleteFolder = async (context: SecurityContext, folderId: string, unitOfWork: UnitOfWork): Promise<World> => {
		const folder = await unitOfWork.wikiFolderRepository.findById(folderId);
		if (!folder) {
			throw new Error("Folder does not exist");
		}

		await this.checkUserWritePermissionForFolderContents(context, folderId, unitOfWork);

		const worlds = await unitOfWork.worldRepository.find([
			new FilterCondition("rootFolder", folder._id),
		]);
		if (worlds.length !== 0) {
			throw new Error("You cannot delete the root folder of a world");
		}

		const parents = await unitOfWork.wikiFolderRepository.find([
			new FilterCondition("children", folder._id),
		]);
		for (let parent of parents) {
			parent.children = parent.children.filter((child) => child !== folder._id);
			await unitOfWork.wikiFolderRepository.update(parent);
		}

		await this.recurseDeleteFolder(folder, unitOfWork);

		return unitOfWork.worldRepository.findById(folder.world);
	};

	moveFolder = async (
		context: SecurityContext,
		folderId: string,
		parentFolderId: string,
		unitOfWork: UnitOfWork
	): Promise<World> => {
		const folder = await unitOfWork.wikiFolderRepository.findById(folderId);
		if (!folder) {
			throw new Error(`Folder with id ${folderId} does not exist`);
		}
		const parentFolder = await unitOfWork.wikiFolderRepository.findById(parentFolderId);
		if (!parentFolder) {
			throw new Error(`Folder with id ${parentFolderId} does not exist`);
		}
		if (folderId === parentFolderId) {
			throw new Error("Folder cannot be a parent of itself");
		}

		const currentParent = await unitOfWork.wikiFolderRepository.findOne([
			new FilterCondition("children", folderId),
		]);

		for (let folderToCheck of [folder, parentFolder, currentParent]) {
			if (!(await folderToCheck.authorizationPolicy.canWrite(context, unitOfWork))) {
				throw new Error(`You do not have permission to edit folder ${folderToCheck.name}`);
			}
		}

		currentParent.children = currentParent.children.filter((childId) => childId !== folder._id);
		await unitOfWork.wikiFolderRepository.update(currentParent);
		parentFolder.children.push(folder._id);
		await unitOfWork.wikiFolderRepository.update(parentFolder);
		return unitOfWork.worldRepository.findById(folder.world);
	};

	getFolders = async (
		context: SecurityContext,
		worldId: string,
		name: string,
		canAdmin: boolean,
		unitOfWork: UnitOfWork
	): Promise<WikiFolder[]> => {
		const world = await unitOfWork.worldRepository.findById(worldId);
		if (!world) {
			throw new Error("World does not exist");
		}
		if (!(await world.authorizationPolicy.canRead(context, unitOfWork))) {
			throw new Error("You do not have permission to read this World");
		}

		const conditions: FilterCondition[] = [new FilterCondition("world", worldId)];
		if (name) {
			conditions.push(new FilterCondition("name", name, FILTER_CONDITION_REGEX));
		}

		const results = await unitOfWork.wikiFolderRepository.find(conditions);

		const docs = [];
		for (let doc of results) {
			if (
				canAdmin !== undefined &&
				!(await doc.authorizationPolicy.canAdmin(context))
			) {
				continue;
			}
			if (await doc.authorizationPolicy.canRead(context, unitOfWork)) {
				docs.push(doc);
			}
		}
		return docs;
	};

	getFolderPath = async (context: SecurityContext, wikiId: string, unitOfWork: UnitOfWork): Promise<WikiFolder[]> => {
		const path = [];
		let folder = await unitOfWork.wikiFolderRepository.findOne([new FilterCondition("pages", wikiId)]);
		while (folder) {
			path.push(folder);
			folder = await unitOfWork.wikiFolderRepository.findOne([
				new FilterCondition("children", folder._id),
			]);
		}
		return path;
	};

	private recurseDeleteFolder = async (folder: WikiFolder, unitOfWork: UnitOfWork) => {
		const children = await unitOfWork.wikiFolderRepository.find([
			new FilterCondition("_id", folder.children, FILTER_CONDITION_OPERATOR_IN),
		]);
		for (let child of children) {
			await this.recurseDeleteFolder(child, unitOfWork);
		}

		for (let pageId of folder.pages) {
			await this.authorizationService.cleanUpPermissions(pageId, unitOfWork);
			const page = await unitOfWork.wikiPageRepository.findById(pageId);
			await unitOfWork.wikiPageRepository.delete(page);
		}

		await this.authorizationService.cleanUpPermissions(folder._id, unitOfWork);
		await unitOfWork.wikiFolderRepository.delete(folder);
	};

	private checkUserWritePermissionForFolderContents = async (
		context: SecurityContext,
		folderId: string,
		unitOfWork: UnitOfWork
	) => {
		const folder = await unitOfWork.wikiFolderRepository.findById(folderId);

		if (!(await folder.authorizationPolicy.canWrite(context, unitOfWork))) {
			throw new Error(`You do not have write permission for the folder ${folderId}`);
		}

		// pages are auto populated
		for (let childPage of folder.pages) {
			const wikiPage = await unitOfWork.wikiPageRepository.findById(childPage);
			if (
				!(await wikiPage.authorizationPolicy.canWrite(context, unitOfWork))
			) {
				throw new Error(`You do not have write permission for the page ${childPage}`);
			}
		}

		// children folders are not auto populated
		for (let childFolder of folder.children) {
			await this.checkUserWritePermissionForFolderContents(context, childFolder, unitOfWork);
		}
	};
}
