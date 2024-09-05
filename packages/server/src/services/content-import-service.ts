import { SecurityContext } from "../security/security-context";
import { inject, injectable } from "inversify";
import {
	Archive,
	AbstractArchiveFactory, RepositoryAccessor,
} from "../types";
import { Model } from "../domain-entities/model";
import { WikiFolder } from "../domain-entities/wiki-folder";
import { Image } from "../domain-entities/image";
import { WikiPage } from "../domain-entities/wiki-page";
import { ModeledPage } from "../domain-entities/modeled-page";
import { Place } from "../domain-entities/place";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import {Repository} from "../dal/repository/repository";
import {DatabaseContext} from "../dal/database-context";
import WikiFolderFactory from "../domain-entities/factory/wiki-folder-factory";
import {
	MODEL_ADMIN,
	MODEL_RW,
	WIKI_ADMIN,
	WIKI_FOLDER_PERMISSIONS,
	WIKI_RW
} from "@rpgtools/common/src/permission-constants";
import {ALL_WIKI_TYPES, CHUNK, FILE, IMAGE, MODEL, USER} from "@rpgtools/common/src/type-constants";
import {World} from "../domain-entities/world";

import fetch from 'node-fetch';
import {Readable} from "stream";
import unzipper from "unzipper";
import EntityMapper from "../domain-entities/entity-mapper";
import FileFactory from "../domain-entities/factory/file-factory";

@injectable()
export class ContentImportService {

	@inject(INJECTABLE_TYPES.ArchiveFactory)
	archiveFactory: AbstractArchiveFactory;

	@inject(INJECTABLE_TYPES.WikiFolderFactory)
	wikiFolderFactory: WikiFolderFactory;

	@inject(INJECTABLE_TYPES.EntityMapper)
	entityMapper: EntityMapper;

	@inject(INJECTABLE_TYPES.FileFactory)
	fileFactory: FileFactory;

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

		await this.processZip(folder, zipFile, databaseContext, context);

		return folder;
	};

	private async processZip(
		destinationFolder: WikiFolder,
		archiveReadStream: Readable,
	   	databaseContext: DatabaseContext,
	   	securityContext: SecurityContext
	) {
		if (!await destinationFolder.authorizationPolicy.canWrite(securityContext, databaseContext)) {
			throw new Error("You do not have permission to add content to this folder");
		}
		const directory = await unzipper.Open.buffer(await this.readFile(archiveReadStream));
		const fileEntries: unzipper.File[] = directory.files.filter((entry) => this.getModelFromPath(entry.path) === FILE);
		const chunkEntries = directory.files.filter((entry) => this.getModelFromPath(entry.path) === CHUNK);
		const imageEntries = directory.files.filter((entry) => this.getModelFromPath(entry.path) === IMAGE);
		const modelEntries = directory.files.filter((entry) => this.getModelFromPath(entry.path) === MODEL);
		const wikiEntries = directory.files.filter((entry) => ALL_WIKI_TYPES.includes(this.getModelFromPath(entry.path)));

		for (let entries of [fileEntries, chunkEntries, modelEntries]) {
			for (let entry of entries) {
				await this.addEntryToRepository(entry, destinationFolder, databaseContext, securityContext);
			}
		}

		const parentImageEntries = [];
		for (let entry of imageEntries) {
			const rawEntity = await this.getEntryContent(entry);
			if (rawEntity.icon) {
				await this.addEntryToRepository(entry, destinationFolder, databaseContext, securityContext);
			} else {
				parentImageEntries.push(entry);
			}
		}

		for (let entries of [parentImageEntries, wikiEntries]) {
			for (let entry of entries) {
				await this.addEntryToRepository(entry, destinationFolder, databaseContext, securityContext);
			}
		}
	}

	private readFile = async (entry: Readable): Promise<Buffer> => {
		const chunks: Buffer[] = [];
		return await new Promise((resolve, reject) => {
			entry.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
			entry.on('error', (err) => reject(err));
			entry.on('end', () => resolve(Buffer.concat(chunks)));
		});
	}

	private createReadStream = async (entry: unzipper.File): Promise<Readable> => {
		return Readable.from(await entry.buffer());
	}

	private addEntryToRepository = async (entry: unzipper.File, rootFolder: WikiFolder, archive: RepositoryAccessor, securityContext: SecurityContext): Promise<void> => {
		const entryType = this.getModelFromPath(entry.path);
		if (entryType === FILE) {
			const filename: string = this.getFilenameFromPath(entry.path);
			const id = filename.split(".")[1];
			const newFile = this.fileFactory.build({
				_id: id,
				filename,
				readStream: await this.createReadStream(entry),
				mimeType: 'application/json'
			})
			await archive.fileRepository.create(newFile, true);
		} else {
			const rawEntity = await this.getEntryContent(entry);
			const sibling = this.entityMapper.map(entryType);
			const entity = sibling.factory.build(rawEntity);
			const repo = entity.getRepository(archive);
			await repo.create(entity, true);
			if (ALL_WIKI_TYPES.includes(entryType)) {
				const page = entity as WikiPage;
				await this.addWikiToFolder(page, entry.path, rootFolder, archive, securityContext);
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
				page.world = rootFolder.world;
			}
		}
	};

	private async addWikiToFolder(wikiPage: WikiPage, path: string, rootFolder: WikiFolder, archive: RepositoryAccessor, securityContext: SecurityContext) {
		const wikiFolder = await this.addPath(path.split('/').slice(1, -1).join('/'), rootFolder, archive, securityContext);
		wikiFolder.pages.push(wikiPage._id);
		await archive.wikiFolderRepository.update(wikiFolder);
	}

	private async addPath(path: string, currentFolder: WikiFolder, archive: RepositoryAccessor, securityContext: SecurityContext): Promise<WikiFolder> {
		const nextFolderName = path.split('/')[0];
		const currentFolderChildren = await Promise.all(currentFolder.children.map(async child => await archive.wikiFolderRepository.findOneById(child)));
		let nextFolder = currentFolderChildren.find(folder => folder.name === nextFolderName);
		if (!nextFolder) {
			nextFolder = await this.addFolder(nextFolderName, currentFolder, archive, securityContext);
		}

		if (path.split('/').length !== 1) {
			return this.addPath(path.split('/').slice(1).join(), nextFolder, archive, securityContext);
		}
		return nextFolder;
	}

	private async addFolder(name: string, currentFolder: WikiFolder, archive: RepositoryAccessor, securityContext: SecurityContext) {
		const newFolder = this.wikiFolderFactory.build(
			{
				name,
				world: currentFolder.world,
				pages: [],
				children: [],
				acl: WIKI_FOLDER_PERMISSIONS.map((permission) => {
					return {
						permission,
						principal: securityContext.user._id,
						principalType: USER
					}
				})
			}
		);
		await archive.wikiFolderRepository.create(newFolder);
		if (currentFolder) {
			currentFolder.children.push(newFolder._id);
			await archive.wikiFolderRepository.update(currentFolder);
		}
		return newFolder;
	}

	private getEntryContent = async (entry: unzipper.File): Promise<any> => {
		const buffer: Buffer = await this.readFile(await this.createReadStream(entry));
		const bufferContent = buffer.toString('utf-8');
		return JSON.parse(bufferContent);
	};

	private getModelFromPath(path: string): string {
		return this.getFilenameFromPath(path).split(".")[0];
	}

	private getFilenameFromPath(path: string): string {
		const pathComponents = path.split("/");
		return pathComponents[pathComponents.length - 1];
	}

	// old process

	private processArchive = async (
		archive: Archive,
		destinationFolder: WikiFolder,
		databaseContext: DatabaseContext,
		securityContext: SecurityContext
	) => {
		for (let page of await archive.articleRepository.findAll()) {
			await this.importWikiPage(
				page,
				archive,
				databaseContext.articleRepository,
				destinationFolder,
				databaseContext,
				securityContext
			);
		}
		for (let page of await archive.itemRepository.findAll()) {
			await this.importModeledWiki(
				page,
				archive,
				databaseContext.itemRepository,
				destinationFolder,
				databaseContext,
				securityContext
			);
		}
		for (let page of await archive.monsterRepository.findAll()) {
			await this.importModeledWiki(
				page,
				archive,
				databaseContext.monsterRepository,
				destinationFolder,
				databaseContext,
				securityContext
			);
		}
		for (let page of await archive.personRepository.findAll()) {
			await this.importModeledWiki(
				page,
				archive,
				databaseContext.personRepository,
				destinationFolder,
				databaseContext,
				securityContext
			);
		}
		for (let page of await archive.placeRepository.findAll()) {
			await this.importPlace(page, archive, destinationFolder, databaseContext, securityContext);
		}
		for (let model of await archive.modelRepository.findAll()) {
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
		for (let chunkId of chunks) {
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
			for (let child of children) {
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
		for (let permission of [MODEL_RW, MODEL_ADMIN]) {
			model.acl.push({
				permission,
				principal: securityContext.user._id,
				principalType: USER
			});
		}
		await databaseContext.modelRepository.create(model);
	};
}
