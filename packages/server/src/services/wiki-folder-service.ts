import {
	ApplicationService,
	EntityAuthorizationRuleset,
	PermissionAssignmentRepository,
	Repository,
	UserRepository,
	WikiFolderRepository,
	WikiPageRepository,
	WorldRepository,
} from "../types";
import { WikiFolder } from "../domain-entities/wiki-folder";
import { inject } from "inversify";
import { INJECTABLE_TYPES } from "../injectable-types";
import { PermissionAssignment } from "../domain-entities/permission-assignment";
import { WikiFolderAuthorizationRuleset } from "../security/wiki-folder-authorization-ruleset";
import { WikiPage } from "../domain-entities/wiki-page";
import { WikiPageAuthorizationRuleset } from "../security/wiki-page-authorization-ruleset";
import { SecurityContext } from "../security-context";
import { Article } from "../domain-entities/article";
import { FILTER_CONDITION_OPERATOR_IN, FilterCondition } from "../dal/filter-condition";
import { AuthorizationService } from "./authorization-application-service";
import { FOLDER_ADMIN, FOLDER_RW } from "../../../common/src/permission-constants";
import { WIKI_FOLDER } from "../../../common/src/type-constants";
import { World } from "../domain-entities/world";

export class WikiFolderService implements ApplicationService {
	@inject(INJECTABLE_TYPES.WikiFolderRepository)
	wikiFolderRepository: WikiFolderRepository;

	@inject(INJECTABLE_TYPES.PermissionAssignmentRepository)
	permissionAssignmentRepository: PermissionAssignmentRepository;

	@inject(INJECTABLE_TYPES.WikiPageRepository)
	wikiPageRepository: WikiPageRepository;

	@inject(INJECTABLE_TYPES.UserRepository)
	userRepository: UserRepository;

	@inject(INJECTABLE_TYPES.WorldRepository)
	worldRepository: WorldRepository;

	wikiFolderAuthorizationRuleset: EntityAuthorizationRuleset<WikiFolder> = new WikiFolderAuthorizationRuleset();
	wikiPageAuthorizationRuleset: EntityAuthorizationRuleset<WikiPage> = new WikiPageAuthorizationRuleset();

	authorizationService: AuthorizationService = new AuthorizationService();

	checkUserWritePermissionForFolderContents = async (
		context: SecurityContext,
		folderId: string
	) => {
		const folder = await this.wikiFolderRepository.findById(folderId);

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
			await this.checkUserWritePermissionForFolderContents(context, childFolder);
		}
	};

	recurseDeleteFolder = async (folder: WikiFolder) => {
		const children = await this.wikiFolderRepository.find([
			new FilterCondition("_id", folder.children, FILTER_CONDITION_OPERATOR_IN),
		]);
		for (let child of children) {
			await this.recurseDeleteFolder(child);
		}

		for (let page of folder.pages) {
			await this.authorizationService.cleanUpPermissions(page);
			await this.wikiPageRepository.delete(new WikiPage(page, "", "", "", ""));
		}

		await this.authorizationService.cleanUpPermissions(folder._id);
		await this.wikiFolderRepository.delete(folder);
	};

	createFolder = async (
		context: SecurityContext,
		name: string,
		parentFolderId: string
	): Promise<World> => {
		const parentFolder = await this.wikiFolderRepository.findById(parentFolderId);
		if (!parentFolder) {
			throw new Error("Parent folder does not exist");
		}

		if (!(await this.wikiFolderAuthorizationRuleset.canWrite(context, parentFolder))) {
			throw new Error(`You do not have permission for this folder`);
		}
		const newFolder = new WikiFolder("", name, parentFolder.world, [], []);
		await this.wikiFolderRepository.create(newFolder);
		parentFolder.children.push(newFolder._id);
		await this.wikiFolderRepository.update(parentFolder);

		for (let permission of [FOLDER_RW, FOLDER_ADMIN]) {
			const newPermission = new PermissionAssignment("", permission, newFolder._id, WIKI_FOLDER);
			await this.permissionAssignmentRepository.create(newPermission);
			context.user.permissions.push(newPermission._id);
		}
		await this.userRepository.update(context.user);

		return await this.worldRepository.findById(newFolder.world);
	};

	renameFolder = async (
		context: SecurityContext,
		folderId: string,
		name: string
	): Promise<WikiFolder> => {
		const folder = await this.wikiFolderRepository.findById(folderId);
		if (!folder) {
			throw new Error("Folder does not exist");
		}
		if (!(await this.wikiFolderAuthorizationRuleset.canWrite(context, folder))) {
			throw new Error(`You do not have permission for this folder`);
		}

		folder.name = name;
		await this.wikiFolderRepository.update(folder);
		return folder;
	};

	deleteFolder = async (context: SecurityContext, folderId: string): Promise<World> => {
		const folder = await this.wikiFolderRepository.findById(folderId);
		if (!folder) {
			throw new Error("Folder does not exist");
		}

		await this.checkUserWritePermissionForFolderContents(context, folderId);

		const worlds = await this.worldRepository.find([new FilterCondition("rootFolder", folder._id)]);
		if (worlds.length !== 0) {
			throw new Error("You cannot delete the root folder of a world");
		}

		const parents = await this.wikiFolderRepository.find([
			new FilterCondition("children", folder._id),
		]);
		for (let parent of parents) {
			parent.children = parent.children.filter((child) => child === folder._id);
			await this.wikiFolderRepository.update(parent);
		}

		await this.recurseDeleteFolder(folder);

		return await this.worldRepository.findById(folder.world);
	};

	moveFolder = async (
		context: SecurityContext,
		folderId: string,
		parentFolderId: string
	): Promise<World> => {
		const folder = await this.wikiFolderRepository.findById(folderId);
		if (!folder) {
			throw new Error(`Folder with id ${folderId} does not exist`);
		}
		const parentFolder = await this.wikiFolderRepository.findById(parentFolderId);
		if (!parentFolder) {
			throw new Error(`Folder with id ${parentFolderId} does not exist`);
		}
		if (folderId === parentFolderId) {
			throw new Error("Folder cannot be a parent of itself");
		}

		const currentParent = await this.wikiFolderRepository.findOne([
			new FilterCondition("children", folderId),
		]);

		for (let folderToCheck of [folder, parentFolder, currentParent]) {
			if (!(await this.wikiFolderAuthorizationRuleset.canWrite(context, folderToCheck))) {
				throw new Error(`You do not have permission to edit folder ${folderToCheck.name}`);
			}
		}

		currentParent.children = currentParent.children.filter((childId) => childId !== folder._id);
		await this.wikiFolderRepository.update(currentParent);
		parentFolder.children.push(folder._id);
		await this.wikiFolderRepository.update(parentFolder);
		return await this.worldRepository.findById(folder.world);
	};
}
