import { WikiFolder } from "../domain-entities/wiki-folder.js";
import { SecurityContext } from "../security/security-context.js";
import { FOLDER_ADMIN, FOLDER_RW } from "@rpgtools/common/src/permission-constants";
import {USER} from "@rpgtools/common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types.js";
import {AuthorizationService} from "./authorization-service.js";
import {DatabaseContext} from "../dal/database-context.js";
import WikiFolderFactory from "../domain-entities/factory/wiki-folder-factory.js";

@injectable()
export class WikiFolderService {

	@inject(INJECTABLE_TYPES.AuthorizationService)
	authorizationService: AuthorizationService;

	@inject(INJECTABLE_TYPES.WikiFolderFactory)
	wikiFolderFactory: WikiFolderFactory;

	createFolder = async (
		context: SecurityContext,
		name: string,
		parentFolderId: string,
		databaseContext: DatabaseContext
	): Promise<WikiFolder> => {
		const parentFolder = await databaseContext.wikiFolderRepository.findOneById(parentFolderId);
		if (!parentFolder) {
			throw new Error("Parent folder does not exist");
		}

		if (!(await parentFolder.authorizationPolicy.canWrite(context, databaseContext))) {
			throw new Error(`You do not have permission for this folder`);
		}
		const newFolder = this.wikiFolderFactory.build({name, world: parentFolder.world, pages: [], children: [], acl: []});
		await databaseContext.wikiFolderRepository.create(newFolder);
		parentFolder.children.push(newFolder._id);
		await databaseContext.wikiFolderRepository.update(parentFolder);

		for (const permission of [FOLDER_RW, FOLDER_ADMIN]) {
			newFolder.acl.push({
				permission,
				principal: context.user._id,
				principalType: USER
			})
		}
		await databaseContext.userRepository.update(context.user);
		await databaseContext.wikiFolderRepository.update(newFolder);
		return parentFolder;
	};

	renameFolder = async (
		context: SecurityContext,
		folderId: string,
		name: string,
		databaseContext: DatabaseContext
	): Promise<WikiFolder> => {
		const folder = await databaseContext.wikiFolderRepository.findOneById(folderId);
		if (!folder) {
			throw new Error("Folder does not exist");
		}
		if (!(await folder.authorizationPolicy.canWrite(context, databaseContext))) {
			throw new Error(`You do not have permission for this folder`);
		}

		folder.name = name;
		await databaseContext.wikiFolderRepository.update(folder);
		return folder;
	};

	deleteFolder = async (context: SecurityContext, folderId: string, databaseContext: DatabaseContext): Promise<WikiFolder> => {
		const folder = await databaseContext.wikiFolderRepository.findOneById(folderId);
		if (!folder) {
			throw new Error("Folder does not exist");
		}

		await this.checkUserWritePermissionForFolderContents(context, folderId, databaseContext);

		const worlds = await databaseContext.worldRepository.findByRootFolder(folderId);
		if (worlds.length !== 0) {
			throw new Error("You cannot delete the root folder of a world");
		}

		const parent = await databaseContext.wikiFolderRepository.findOneWithChild(folderId);
		parent.children = parent.children.filter((child: string) => child !== folder._id);
		await databaseContext.wikiFolderRepository.update(parent);

		await this.recurseDeleteFolder(folder, databaseContext);

		return parent;
	};

	moveFolder = async (
		context: SecurityContext,
		folderId: string,
		parentFolderId: string,
		databaseContext: DatabaseContext
	): Promise<WikiFolder> => {
		const folder = await databaseContext.wikiFolderRepository.findOneById(folderId);
		if (!folder) {
			throw new Error(`Folder with id ${folderId} does not exist`);
		}
		const parentFolder = await databaseContext.wikiFolderRepository.findOneById(parentFolderId);
		if (!parentFolder) {
			throw new Error(`Folder with id ${parentFolderId} does not exist`);
		}
		if (folderId === parentFolderId) {
			throw new Error("Folder cannot be a parent of itself");
		}

		const currentParent = await databaseContext.wikiFolderRepository.findOneWithChild(folderId);

		for (const folderToCheck of [folder, parentFolder, currentParent]) {
			if (!(await folderToCheck.authorizationPolicy.canWrite(context, databaseContext))) {
				throw new Error(`You do not have permission to edit folder ${folderToCheck.name}`);
			}
		}

		currentParent.children = currentParent.children.filter((childId: string) => childId !== folder._id);
		await databaseContext.wikiFolderRepository.update(currentParent);
		parentFolder.children.push(folder._id);
		await databaseContext.wikiFolderRepository.update(parentFolder);
		return parentFolder;
	};

	getFolders = async (
		context: SecurityContext,
		worldId: string,
		name: string,
		canAdmin: boolean,
		databaseContext: DatabaseContext
	): Promise<WikiFolder[]> => {
		const world = await databaseContext.worldRepository.findOneById(worldId);
		if (!world) {
			throw new Error("World does not exist");
		}
		if (!(await world.authorizationPolicy.canRead(context, databaseContext))) {
			throw new Error("You do not have permission to read this World");
		}

		const results = await databaseContext.wikiFolderRepository.findByWorldAndName(worldId, name);

		const docs = [];
		for (const doc of results) {
			if (
				canAdmin !== undefined &&
				!(await doc.authorizationPolicy.canAdmin(context, databaseContext))
			) {
				continue;
			}
			if (await doc.authorizationPolicy.canRead(context, databaseContext)) {
				docs.push(doc);
			}
		}
		return docs;
	};

	getFolderPath = async (context: SecurityContext, wikiId: string, databaseContext: DatabaseContext): Promise<WikiFolder[]> => {
		const path = [];
		let folder = await databaseContext.wikiFolderRepository.findOneWithPage(wikiId);
		while (folder) {
			path.push(folder);
			folder = await databaseContext.wikiFolderRepository.findOneWithChild(folder._id);
		}
		return path;
	};

	private recurseDeleteFolder = async (folder: WikiFolder, databaseContext: DatabaseContext) => {
		const children = await databaseContext.wikiFolderRepository.findByIds(folder.children);
		for (const child of children) {
			await this.recurseDeleteFolder(child, databaseContext);
		}

		for (const pageId of folder.pages) {
			const page = await databaseContext.wikiPageRepository.findOneById(pageId);
			await databaseContext.wikiPageRepository.delete(page);
		}

		await databaseContext.wikiFolderRepository.delete(folder);
	};

	private checkUserWritePermissionForFolderContents = async (
		context: SecurityContext,
		folderId: string,
		databaseContext: DatabaseContext
	) => {
		const folder = await databaseContext.wikiFolderRepository.findOneById(folderId);

		if (!(await folder.authorizationPolicy.canWrite(context, databaseContext))) {
			throw new Error(`You do not have write permission for the folder ${folderId}`);
		}

		// pages are auto populated
		for (const childPage of folder.pages) {
			const wikiPage = await databaseContext.wikiPageRepository.findOneById(childPage);
			if (
				!(await wikiPage.authorizationPolicy.canWrite(context, databaseContext))
			) {
				throw new Error(`You do not have write permission for the page ${childPage}`);
			}
		}

		// children folders are not auto populated
		for (const childFolder of folder.children) {
			await this.checkUserWritePermissionForFolderContents(context, childFolder, databaseContext);
		}
	};
}
