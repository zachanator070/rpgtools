import { Archive } from "../types";
import {
	MODEL, MODELED_WIKI_TYPES,
	WIKI_FOLDER,
	WIKI_PAGE,
} from "@rpgtools/common/src/type-constants";
import { WikiPage } from "../domain-entities/wiki-page.js";
import { SecurityContext } from "../security/security-context.js";
import { EntityNotFoundError, ReadPermissionDeniedError } from "../errors.js";
import { ModeledPage } from "../domain-entities/modeled-page.js";
import { Image } from "../domain-entities/image.js";
import { Chunk } from "../domain-entities/chunk.js";
import { WikiFolder } from "../domain-entities/wiki-folder.js";
import { Model } from "../domain-entities/model.js";
import { File } from "../domain-entities/file.js";
import { injectable } from "inversify";
import {DatabaseContext} from "../dal/database-context.js";

@injectable()
export class ContentExportService {

	public exportWikiPage = async (
		context: SecurityContext,
		docId: string,
		wikiType: string,
		archive: Archive,
		databaseContext: DatabaseContext
	): Promise<string> => {
		let page = await databaseContext.wikiPageRepository.findOneById(docId);
		if (!page) {
			throw new EntityNotFoundError(docId, WIKI_PAGE);
		}
		const repo = page.getRepository(databaseContext);
		page = await repo.findOneById(docId) as WikiPage;
		if (!await page.authorizationPolicy.canRead(context, databaseContext)) {
			return;
		}

		if (MODELED_WIKI_TYPES.includes(wikiType)) {
			await this.addModeledWikiPageRelationships(context, page as ModeledPage, archive, databaseContext);
		}

		//add to archive
		const archiveRepo = page.getRepository(archive);
		await archiveRepo.create(page);

		await this.addWikiPageRelationships(context, page, archive, databaseContext);

		return page.name;
	};

	public exportModel = async (context: SecurityContext, docId: string, archive: Archive, databaseContext: DatabaseContext): Promise<string> => {
		const model = await databaseContext.modelRepository.findOneById(docId);
		if (!model) {
			throw new EntityNotFoundError(docId, MODEL);
		}
		await this.addModel(context, model, archive, databaseContext, true);
		return model.name;
	};

	public exportWikiFolder = async (
		context: SecurityContext,
		docId: string,
		archive: Archive,
		databaseContext: DatabaseContext,
		errorOut = true
	): Promise<string> => {
		const folder = await databaseContext.wikiFolderRepository.findOneById(docId);
		if (!folder) {
			throw new EntityNotFoundError(docId, WIKI_FOLDER);
		}

		const world = await databaseContext.worldRepository.findOneById(folder.world);
		await archive.worldRepository.create(world);

		await this.addWikiFolder(context, folder, archive, databaseContext, errorOut);

		return folder.name;
	};

	private addWikiFolder = async (
		context: SecurityContext,
		folder: WikiFolder,
		archive: Archive,
		databaseContext: DatabaseContext,
		errorOut = false
	) => {
		if (!(await folder.authorizationPolicy.canRead(context, databaseContext))) {
			if (errorOut) {
				throw new ReadPermissionDeniedError(folder._id, WIKI_FOLDER);
			}
			return;
		}

		for (const pageId of folder.pages) {
			const page = await databaseContext.wikiPageRepository.findOneById(pageId);
			await this.exportWikiPage(context, pageId, page.type, archive, databaseContext);
		}

		for (const childId of folder.children) {
			const child = await databaseContext.wikiFolderRepository.findOneById(childId);
			await this.addWikiFolder(context, child, archive, databaseContext, false);
		}

		await archive.wikiFolderRepository.create(folder);
	};

	private addImage = async (
		context: SecurityContext,
		image: Image,
		archive: Archive,
		databaseContext: DatabaseContext
	) => {
		if (image.icon) {
			const icon = await databaseContext.imageRepository.findOneById(image.icon);
			await this.addImage(context, icon, archive, databaseContext);
		}
		const chunks: Chunk[] = await databaseContext.chunkRepository.findByIds(image.chunks);
		for (const chunk of chunks) {
			await archive.chunkRepository.create(chunk);
			const file = await databaseContext.fileRepository.findOneById(chunk.fileId);
			await this.addFile(file, archive);
		}
		await archive.imageRepository.create(image);
	};

	private addModel = async (
		context: SecurityContext,
		page: Model,
		archive: Archive,
		databaseContext: DatabaseContext,
		errorOut = false
	) => {
		if (!(await page.authorizationPolicy.canRead(context, databaseContext))) {
			if (errorOut) {
				return new ReadPermissionDeniedError(page._id, MODEL);
			}
			return;
		}
		await archive.modelRepository.create(page);
		if (page.fileId) {
			const file = await databaseContext.fileRepository.findOneById(page.fileId);
			await this.addFile(file, archive);
		}
	};

	private addFile = async (file: File, archive: Archive) => {
		await archive.fileRepository.create(file);
	};

	private addModeledWikiPageRelationships = async (
		context: SecurityContext,
		page: ModeledPage,
		archive: Archive,
		databaseContext: DatabaseContext
	) => {
		if (page.pageModel) {
			const model = await databaseContext.modelRepository.findOneById(page.pageModel);
			await this.addModel(context, model, archive, databaseContext);
		}
	};

	private addWikiPageRelationships = async (
		context: SecurityContext,
		page: WikiPage,
		archive: Archive,
		databaseContext: DatabaseContext
	) => {
		if (page.coverImage) {
			const image = await databaseContext.imageRepository.findOneById(page.coverImage);
			await this.addImage(context, image, archive, databaseContext);
		}
		if (page.contentId) {
			const file = await databaseContext.fileRepository.findOneById(page.contentId);
			await this.addFile(file, archive);
		}
		const world = await databaseContext.worldRepository.findOneById(page.world);
		await archive.worldRepository.create(world);
	};
}
