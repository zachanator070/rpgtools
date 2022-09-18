import {
	ArticleFactory,
	UnitOfWork,
	WikiFolderFactory,
} from "../types";
import { WikiFolder } from "../domain-entities/wiki-folder";
import { SecurityContext } from "../security/security-context";
import { FOLDER_ADMIN, FOLDER_RW } from "@rpgtools/common/src/permission-constants";
import {USER} from "@rpgtools/common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import {AuthorizationService} from "./authorization-service";

@injectable()
export class WikiFolderService {

	@inject(INJECTABLE_TYPES.AuthorizationService)
	authorizationService: AuthorizationService;

	@inject(INJECTABLE_TYPES.WikiFolderFactory)
	wikiFolderFactory: WikiFolderFactory;
	@inject(INJECTABLE_TYPES.ArticleFactory)
	articleFactory: ArticleFactory;

	createFolder = async (
		context: SecurityContext,
		name: string,
		parentFolderId: string,
		unitOfWork: UnitOfWork
	): Promise<WikiFolder> => {
		const parentFolder = await unitOfWork.wikiFolderRepository.findOneById(parentFolderId);
		if (!parentFolder) {
			throw new Error("Parent folder does not exist");
		}

		if (!(await parentFolder.authorizationPolicy.canWrite(context, unitOfWork))) {
			throw new Error(`You do not have permission for this folder`);
		}
		const newFolder = this.wikiFolderFactory({_id: null, name, world: parentFolder.world, pages: [], children: [], acl: []});
		await unitOfWork.wikiFolderRepository.create(newFolder);
		parentFolder.children.push(newFolder._id);
		await unitOfWork.wikiFolderRepository.update(parentFolder);

		for (let permission of [FOLDER_RW, FOLDER_ADMIN]) {
			newFolder.acl.push({
				permission,
				principal: context.user._id,
				principalType: USER
			})
		}
		await unitOfWork.userRepository.update(context.user);
		await unitOfWork.wikiFolderRepository.update(newFolder);
		return parentFolder;
	};

	renameFolder = async (
		context: SecurityContext,
		folderId: string,
		name: string,
		unitOfWork: UnitOfWork
	): Promise<WikiFolder> => {
		const folder = await unitOfWork.wikiFolderRepository.findOneById(folderId);
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

	deleteFolder = async (context: SecurityContext, folderId: string, unitOfWork: UnitOfWork): Promise<WikiFolder> => {
		const folder = await unitOfWork.wikiFolderRepository.findOneById(folderId);
		if (!folder) {
			throw new Error("Folder does not exist");
		}

		await this.checkUserWritePermissionForFolderContents(context, folderId, unitOfWork);

		const worlds = await unitOfWork.worldRepository.findByRootFolder(folderId);
		if (worlds.length !== 0) {
			throw new Error("You cannot delete the root folder of a world");
		}

		const parent = await unitOfWork.wikiFolderRepository.findOneWithChild(folderId);
		parent.children = parent.children.filter((child: string) => child !== folder._id);
		await unitOfWork.wikiFolderRepository.update(parent);

		await this.recurseDeleteFolder(folder, unitOfWork);

		return parent;
	};

	moveFolder = async (
		context: SecurityContext,
		folderId: string,
		parentFolderId: string,
		unitOfWork: UnitOfWork
	): Promise<WikiFolder> => {
		const folder = await unitOfWork.wikiFolderRepository.findOneById(folderId);
		if (!folder) {
			throw new Error(`Folder with id ${folderId} does not exist`);
		}
		const parentFolder = await unitOfWork.wikiFolderRepository.findOneById(parentFolderId);
		if (!parentFolder) {
			throw new Error(`Folder with id ${parentFolderId} does not exist`);
		}
		if (folderId === parentFolderId) {
			throw new Error("Folder cannot be a parent of itself");
		}

		const currentParent = await unitOfWork.wikiFolderRepository.findOneWithChild(folderId);

		for (let folderToCheck of [folder, parentFolder, currentParent]) {
			if (!(await folderToCheck.authorizationPolicy.canWrite(context, unitOfWork))) {
				throw new Error(`You do not have permission to edit folder ${folderToCheck.name}`);
			}
		}

		currentParent.children = currentParent.children.filter((childId: string) => childId !== folder._id);
		await unitOfWork.wikiFolderRepository.update(currentParent);
		parentFolder.children.push(folder._id);
		await unitOfWork.wikiFolderRepository.update(parentFolder);
		return parentFolder;
	};

	getFolders = async (
		context: SecurityContext,
		worldId: string,
		name: string,
		canAdmin: boolean,
		unitOfWork: UnitOfWork
	): Promise<WikiFolder[]> => {
		const world = await unitOfWork.worldRepository.findOneById(worldId);
		if (!world) {
			throw new Error("World does not exist");
		}
		if (!(await world.authorizationPolicy.canRead(context, unitOfWork))) {
			throw new Error("You do not have permission to read this World");
		}

		const results = await unitOfWork.wikiFolderRepository.findByWorldAndName(worldId, name);

		const docs = [];
		for (let doc of results) {
			if (
				canAdmin !== undefined &&
				!(await doc.authorizationPolicy.canAdmin(context, unitOfWork))
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
		let folder = await unitOfWork.wikiFolderRepository.findOneWithPage(wikiId);
		while (folder) {
			path.push(folder);
			folder = await unitOfWork.wikiFolderRepository.findOneWithChild(folder._id);
		}
		return path;
	};

	private recurseDeleteFolder = async (folder: WikiFolder, unitOfWork: UnitOfWork) => {
		const children = await unitOfWork.wikiFolderRepository.findByIds(folder.children);
		for (let child of children) {
			await this.recurseDeleteFolder(child, unitOfWork);
		}

		for (let pageId of folder.pages) {
			const page = await unitOfWork.wikiPageRepository.findOneById(pageId);
			await unitOfWork.wikiPageRepository.delete(page);
		}

		await unitOfWork.wikiFolderRepository.delete(folder);
	};

	private checkUserWritePermissionForFolderContents = async (
		context: SecurityContext,
		folderId: string,
		unitOfWork: UnitOfWork
	) => {
		const folder = await unitOfWork.wikiFolderRepository.findOneById(folderId);

		if (!(await folder.authorizationPolicy.canWrite(context, unitOfWork))) {
			throw new Error(`You do not have write permission for the folder ${folderId}`);
		}

		// pages are auto populated
		for (let childPage of folder.pages) {
			const wikiPage = await unitOfWork.wikiPageRepository.findOneById(childPage);
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
