import { SecurityContext } from "../security/security-context.js";
import { inject, injectable } from "inversify";
import {
	Archive,
	AbstractArchiveFactory,
} from "../types";
import { Model } from "../domain-entities/model.js";
import { WikiFolder } from "../domain-entities/wiki-folder.js";
import { Image } from "../domain-entities/image.js";
import { WikiPage } from "../domain-entities/wiki-page.js";
import { ModeledPage } from "../domain-entities/modeled-page.js";
import { Place } from "../domain-entities/place.js";
import { INJECTABLE_TYPES } from "../di/injectable-types.js";
import {Repository} from "../dal/repository/repository.js";
import {DatabaseContext} from "../dal/database-context.js";
import WikiFolderFactory from "../domain-entities/factory/wiki-folder-factory.js";
import {MODEL_ADMIN, MODEL_RW, WIKI_ADMIN, WIKI_RW} from "@rpgtools/common/src/permission-constants.js";
import {USER} from "@rpgtools/common/src/type-constants.js";
import {World} from "../domain-entities/world.js";

import fetch from 'node-fetch';
import {Readable} from "stream";

@injectable()
export class ContentImportService {

	@inject(INJECTABLE_TYPES.ArchiveFactory)
	archiveFactory: AbstractArchiveFactory;

	@inject(INJECTABLE_TYPES.WikiFolderFactory)
	wikiFolderFactory: WikiFolderFactory;

	srdZipUrl = process.env.SRD_ZIP_URL || 'https://github.com/zachanator070/rpgtools-srd/releases/download/4.0.1/rpgtools-srd-4.0.1.zip';

	import5eSrd = async (
		context: SecurityContext,
		worldId: string,
		databaseContext: DatabaseContext
	): Promise<World> => {
		const world = await databaseContext.worldRepository.findOneById(worldId);
		if (!world) {
			throw new Error("World does not exist");
		}
		const rootFolder = await databaseContext.wikiFolderRepository.findOneById(world.rootFolder);
		if (!(await rootFolder.authorizationPolicy.canWrite(context, databaseContext))) {
			throw new Error("You do not have permission to add a top level folder");
		}
		const topFolder = this.wikiFolderFactory.build({name: "5e", world: worldId, pages: [], children: [], acl: []});
		await databaseContext.wikiFolderRepository.create(topFolder);
		rootFolder.children.push(topFolder._id);
		await databaseContext.wikiFolderRepository.update(rootFolder);

		const response = await fetch(this.srdZipUrl);

		await this.importContent(context, rootFolder._id, new Readable().wrap(response.body), databaseContext);

		return world;
	}
	public importContent = async (
		context: SecurityContext,
		folderId: string,
		zipFile: Readable,
		databaseContext: DatabaseContext
	): Promise<WikiFolder> => {
		const folder = await databaseContext.wikiFolderRepository.findOneById(folderId);
		if (!folder) {
			throw new Error("Folder does not exist");
		}
		if (!(await folder.authorizationPolicy.canWrite(context, databaseContext))) {
			throw new Error("You do not have permission to add content to this folder");
		}

		// probably need to detect here what kind of file we are dealing with then create an archive based upon the file type
		const archive = await this.archiveFactory.zipFromZipStream(zipFile);
		try {
			await this.processArchive(archive, folder, databaseContext, context);
		} catch (e) {
			throw new Error(`Error occurred while processing archive: ${e.message}`);
		}

		return folder;
	};

	private processArchive = async (
		archive: Archive,
		destinationFolder: WikiFolder,
		databaseContext: DatabaseContext,
		securityContext: SecurityContext
	) => {
		for (const page of await archive.articleRepository.findAll()) {
			await this.importWikiPage(
				page,
				archive,
				databaseContext.articleRepository,
				destinationFolder,
				databaseContext,
				securityContext
			);
		}
		for (const page of await archive.itemRepository.findAll()) {
			await this.importModeledWiki(
				page,
				archive,
				databaseContext.itemRepository,
				destinationFolder,
				databaseContext,
				securityContext
			);
		}
		for (const page of await archive.monsterRepository.findAll()) {
			await this.importModeledWiki(
				page,
				archive,
				databaseContext.monsterRepository,
				destinationFolder,
				databaseContext,
				securityContext
			);
		}
		for (const page of await archive.personRepository.findAll()) {
			await this.importModeledWiki(
				page,
				archive,
				databaseContext.personRepository,
				destinationFolder,
				databaseContext,
				securityContext
			);
		}
		for (const page of await archive.placeRepository.findAll()) {
			await this.importPlace(page, archive, destinationFolder, databaseContext, securityContext);
		}
		for (const model of await archive.modelRepository.findAll()) {
			await this.importModel(model, archive, destinationFolder, databaseContext, securityContext);
		}
	};

	private importImage = async (
		image: Image,
		destinationFolder: WikiFolder,
		archive: Archive,
		databaseContext: DatabaseContext
	): Promise<void> => {
		const chunks = [...image.chunks];
		image.chunks = [];
		image.world = destinationFolder.world;
		if (image.icon) {
			const icon: Image = await archive.imageRepository.findOneById(image.icon);
			await this.importImage(icon, destinationFolder, archive, databaseContext);
			image.icon = icon._id;
		}
		await databaseContext.imageRepository.create(image);
		for (const chunkId of chunks) {
			const chunk = await archive.chunkRepository.findOneById(chunkId);
			const file = await archive.fileRepository.findOneById(chunk.fileId);
			await databaseContext.fileRepository.create(file);
			chunk.fileId = file._id;
			chunk.image = image._id;
			await databaseContext.chunkRepository.create(chunk);
			image.chunks.push(chunk._id);
		}
		await databaseContext.imageRepository.update(image);
	};

	private importWikiPage = async <T extends WikiPage>(
		page: T,
		archive: Archive,
		destinationRepo: Repository<T>,
		destinationFolder: WikiFolder,
		databaseContext: DatabaseContext,
		securityContext: SecurityContext
	) => {
		let path: WikiFolder[] = [];
		let currentFolder: WikiFolder = await archive.wikiFolderRepository.findOneWithPage(page._id);
		while (currentFolder) {
			path.push(currentFolder);
			currentFolder = await archive.wikiFolderRepository.findOneWithChild(currentFolder._id);

			// root folder has name with null value
			if(currentFolder && !currentFolder.name) {
				currentFolder = null;
			}
		}

		path = path.reverse();

		while (path.length > 0) {
			let foundChild = false;
			const children: WikiFolder[] = await databaseContext.wikiFolderRepository.findByIds(destinationFolder.children);
			for (const child of children) {
				if (child.name === path[0].name) {
					foundChild = true;
					destinationFolder = child;
					path.shift();
					break;
				}
			}
			if (!foundChild) {
				const newFolder = this.wikiFolderFactory.build(
					{
						name: path[0].name,
						world: destinationFolder.world,
						pages: [],
						children: [],
						acl: []
					}
				);
				await databaseContext.wikiFolderRepository.create(newFolder);
				destinationFolder.children.push(newFolder._id);
				await databaseContext.wikiFolderRepository.update(destinationFolder);
				destinationFolder = newFolder;
				path.shift();
			}
		}
		if (page.coverImage) {
			const coverImage = await archive.imageRepository.findOneById(page.coverImage);
			await this.importImage(coverImage, destinationFolder, archive, databaseContext);
			page.coverImage = coverImage._id;
		}
		if (page.contentId) {
			const contentFile = await archive.fileRepository.findOneById(page.contentId);
			await databaseContext.fileRepository.create(contentFile);
			page.contentId = contentFile._id;
		}
		page.acl = [];
		page.acl.push({
			permission: WIKI_RW,
			principal: securityContext.user._id,
			principalType: USER
		});
		page.acl.push({
			permission: WIKI_ADMIN,
			principal: securityContext.user._id,
			principalType: USER
		});
		page.world = destinationFolder.world;
		await destinationRepo.create(page);
		destinationFolder.pages.push(page._id);
		await databaseContext.wikiFolderRepository.update(destinationFolder);
	};

	private importModeledWiki = async <T extends ModeledPage>(
		page: T,
		archive: Archive,
		destinationRepo: Repository<T>,
		destinationRootFolder: WikiFolder,
		databaseContext: DatabaseContext,
		securityContext: SecurityContext
	) => {
		if (page.pageModel) {
			const model = await archive.modelRepository.findOneById(page.pageModel);
			// delete from the source so its not recreated later
			await archive.modelRepository.delete(model);
			await this.importModel(model, archive, destinationRootFolder, databaseContext, securityContext);
			page.pageModel = model._id;
		}
		await this.importWikiPage(page, archive, destinationRepo, destinationRootFolder, databaseContext, securityContext);
	};

	private importPlace = async (
		page: Place,
		archive: Archive,
		destinationRootFolder: WikiFolder,
		databaseContext: DatabaseContext,
		securityContext: SecurityContext
	) => {
		if (page.mapImage) {
			const mapImage: Image = await archive.imageRepository.findOneById(page.mapImage);
			await this.importImage(mapImage, destinationRootFolder, archive, databaseContext);
			page.mapImage = mapImage._id;
		}
		await this.importWikiPage<Place>(
			page,
			archive,
			databaseContext.placeRepository,
			destinationRootFolder,
			databaseContext,
			securityContext
		);
	};

	private importModel = async (
		model: Model,
		archive: Archive,
		destinationRootFolder: WikiFolder,
		databaseContext: DatabaseContext,
		securityContext: SecurityContext
	) => {
		model.world = destinationRootFolder.world;
		if (model.fileId) {
			const file = await archive.fileRepository.findOneById(model.fileId);
			await databaseContext.fileRepository.create(file);
			model.fileId = file._id;
		}
		model.acl = [];
		for (const permission of [MODEL_RW, MODEL_ADMIN]) {
			model.acl.push({
				permission,
				principal: securityContext.user._id,
				principalType: USER
			});
		}
		await databaseContext.modelRepository.create(model);
	};
}
