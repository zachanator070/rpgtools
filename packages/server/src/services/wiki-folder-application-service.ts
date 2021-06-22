import {
	AuthorizationService,
	EntityAuthorizationRuleset,
	UnitOfWork,
	WikiFolderRepository,
	WikiFolderService,
	WorldRepository,
} from "../types";
import { WikiFolder } from "../domain-entities/wiki-folder";
import { PermissionAssignment } from "../domain-entities/permission-assignment";
import { WikiFolderAuthorizationRuleset } from "../security/wiki-folder-authorization-ruleset";
import { WikiPage } from "../domain-entities/wiki-page";
import { WikiPageAuthorizationRuleset } from "../security/wiki-page-authorization-ruleset";
import { SecurityContext } from "../security-context";
import { Article } from "../domain-entities/article";
import {
	FILTER_CONDITION_OPERATOR_IN,
	FILTER_CONDITION_REGEX,
	FilterCondition,
} from "../dal/filter-condition";
import { FOLDER_ADMIN, FOLDER_RW } from "../../../common/src/permission-constants";
import { WIKI_FOLDER } from "../../../common/src/type-constants";
import { World } from "../domain-entities/world";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../injectable-types";
import { DbUnitOfWork } from "../dal/db-unit-of-work";

@injectable()
export class WikiFolderApplicationService implements WikiFolderService {
	wikiFolderAuthorizationRuleset: EntityAuthorizationRuleset<
		WikiFolder,
		WikiFolder
	> = new WikiFolderAuthorizationRuleset();
	wikiPageAuthorizationRuleset: EntityAuthorizationRuleset<
		WikiPage,
		WikiFolder
	> = new WikiPageAuthorizationRuleset();

	@inject(INJECTABLE_TYPES.AuthorizationService)
	authorizationService: AuthorizationService;

	@inject(INJECTABLE_TYPES.WorldRepository)
	worldRepository: WorldRepository;
	@inject(INJECTABLE_TYPES.WikiFolderRepository)
	wikiFolderRepository: WikiFolderRepository;

	private checkUserWritePermissionForFolderContents = async (
		context: SecurityContext,
		folderId: string,
		unitOfWork: UnitOfWork
	) => {
		const folder = await unitOfWork.wikiFolderRepository.findById(folderId);

		if (!(await this.wikiFolderAuthorizationRuleset.canWrite(context, folder))) {
			throw new Error(`You do not have write permission for the folder ${folderId}`);
		}

		// pages are auto populated
		for (let childPage of folder.pages) {
			if (
				!(await this.wikiPageAuthorizationRuleset.canWrite(
					context,
					new Article(childPage, "", "", "", "")
				))
			) {
				throw new Error(`You do not have write permission for the page ${childPage}`);
			}
		}

		// children folders are not auto populated
		for (let childFolder of folder.children) {
			await this.checkUserWritePermissionForFolderContents(context, childFolder, unitOfWork);
		}
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

	createFolder = async (
		context: SecurityContext,
		name: string,
		parentFolderId: string
	): Promise<World> => {
		const unitOfWork = new DbUnitOfWork();
		const parentFolder = await unitOfWork.wikiFolderRepository.findById(parentFolderId);
		if (!parentFolder) {
			throw new Error("Parent folder does not exist");
		}

		if (!(await this.wikiFolderAuthorizationRuleset.canWrite(context, parentFolder))) {
			throw new Error(`You do not have permission for this folder`);
		}
		const newFolder = new WikiFolder("", name, parentFolder.world, [], []);
		await unitOfWork.wikiFolderRepository.create(newFolder);
		parentFolder.children.push(newFolder._id);
		await unitOfWork.wikiFolderRepository.update(parentFolder);

		for (let permission of [FOLDER_RW, FOLDER_ADMIN]) {
			const newPermission = new PermissionAssignment("", permission, newFolder._id, WIKI_FOLDER);
			await unitOfWork.permissionAssignmentRepository.create(newPermission);
			context.user.permissions.push(newPermission._id);
		}
		await unitOfWork.userRepository.update(context.user);
		const world = await unitOfWork.worldRepository.findById(newFolder.world);
		await unitOfWork.commit();
		return world;
	};

	renameFolder = async (
		context: SecurityContext,
		folderId: string,
		name: string
	): Promise<WikiFolder> => {
		const unitOfWork = new DbUnitOfWork();
		const folder = await unitOfWork.wikiFolderRepository.findById(folderId);
		if (!folder) {
			throw new Error("Folder does not exist");
		}
		if (!(await this.wikiFolderAuthorizationRuleset.canWrite(context, folder))) {
			throw new Error(`You do not have permission for this folder`);
		}

		folder.name = name;
		await unitOfWork.wikiFolderRepository.update(folder);
		await unitOfWork.commit();
		return folder;
	};

	deleteFolder = async (context: SecurityContext, folderId: string): Promise<World> => {
		const unitOfWork = new DbUnitOfWork();
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
			parent.children = parent.children.filter((child) => child === folder._id);
			await unitOfWork.wikiFolderRepository.update(parent);
		}

		await this.recurseDeleteFolder(folder, unitOfWork);

		const world = await unitOfWork.worldRepository.findById(folder.world);
		await unitOfWork.commit();
		return world;
	};

	moveFolder = async (
		context: SecurityContext,
		folderId: string,
		parentFolderId: string
	): Promise<World> => {
		const unitOfWork = new DbUnitOfWork();
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
			if (!(await this.wikiFolderAuthorizationRuleset.canWrite(context, folderToCheck))) {
				throw new Error(`You do not have permission to edit folder ${folderToCheck.name}`);
			}
		}

		currentParent.children = currentParent.children.filter((childId) => childId !== folder._id);
		await unitOfWork.wikiFolderRepository.update(currentParent);
		parentFolder.children.push(folder._id);
		await unitOfWork.wikiFolderRepository.update(parentFolder);
		const world = await unitOfWork.worldRepository.findById(folder.world);
		await unitOfWork.commit();
		return world;
	};

	getFolders = async (
		context: SecurityContext,
		worldId: string,
		name: string,
		canAdmin: boolean
	): Promise<WikiFolder[]> => {
		const world = await this.worldRepository.findById(worldId);
		if (!world) {
			throw new Error("World does not exist");
		}
		if (!(await world.authorizationRuleset.canRead(context, world))) {
			throw new Error("You do not have permission to read this World");
		}

		const conditions: FilterCondition[] = [new FilterCondition("world", worldId)];
		if (name) {
			conditions.push(new FilterCondition("name", name, FILTER_CONDITION_REGEX));
		}

		const results = await this.wikiFolderRepository.find(conditions);

		const docs = [];
		for (let doc of results) {
			if (
				canAdmin !== undefined &&
				!(await this.wikiFolderAuthorizationRuleset.canAdmin(context, doc))
			) {
				continue;
			}
			if (await this.wikiFolderAuthorizationRuleset.canRead(context, doc)) {
				docs.push(doc);
			}
		}
		return docs;
	};

	getFolderPath = async (context: SecurityContext, wikiId: string): Promise<WikiFolder[]> => {
		const path = [];
		let folder = await this.wikiFolderRepository.findOne([new FilterCondition("pages", wikiId)]);
		while (folder) {
			path.push(folder);
			folder = await this.wikiFolderRepository.findOne([
				new FilterCondition("children", folder._id),
			]);
		}
		return path;
	};
}
