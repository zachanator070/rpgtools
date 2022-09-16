import { Archive, UnitOfWork } from "../types";
import {
	MODEL, MODELED_WIKI_TYPES,
	WIKI_FOLDER,
	WIKI_PAGE,
} from "@rpgtools/common/src/type-constants";
import { WikiPage } from "../domain-entities/wiki-page";
import { SecurityContext } from "../security/security-context";
import { EntityNotFoundError, ReadPermissionDeniedError } from "../errors";
import { ModeledPage } from "../domain-entities/modeled-page";
import { Image } from "../domain-entities/image";
import { Chunk } from "../domain-entities/chunk";
import { FILTER_CONDITION_OPERATOR_IN, FilterCondition } from "../dal/filter-condition";
import { WikiFolder } from "../domain-entities/wiki-folder";
import { Model } from "../domain-entities/model";
import { File } from "../domain-entities/file";
import { injectable } from "inversify";

@injectable()
export class ContentExportService {

	public exportWikiPage = async (
		context: SecurityContext,
		docId: string,
		wikiType: string,
		archive: Archive,
		unitOfWork: UnitOfWork
	): Promise<string> => {
		let page = await unitOfWork.wikiPageRepository.findById(docId);
		if (!page) {
			throw new EntityNotFoundError(docId, WIKI_PAGE);
		}
		const repo = page.getRepository(unitOfWork);
		page = await repo.findById(docId) as WikiPage;
		if (!await page.authorizationPolicy.canRead(context, unitOfWork)) {
			return;
		}

		if (MODELED_WIKI_TYPES.includes(wikiType)) {
			await this.addModeledWikiPageRelationships(context, page as ModeledPage, archive, unitOfWork);
		}

		//add to archive
		const archiveRepo = page.getRepository(archive);
		await archiveRepo.create(page);

		await this.addWikiPageRelationships(context, page, archive, unitOfWork);

		return page.name;
	};

	public exportModel = async (context: SecurityContext, docId: string, archive: Archive, unitOfWork: UnitOfWork): Promise<string> => {
		const model = await unitOfWork.modelRepository.findById(docId);
		if (!model) {
			throw new EntityNotFoundError(docId, MODEL);
		}
		await this.addModel(context, model, archive, unitOfWork, true);
		return model.name;
	};

	public exportWikiFolder = async (
		context: SecurityContext,
		docId: string,
		archive: Archive,
		unitOfWork: UnitOfWork,
		errorOut = true
	): Promise<string> => {
		const folder = await unitOfWork.wikiFolderRepository.findById(docId);
		if (!folder) {
			throw new EntityNotFoundError(docId, WIKI_FOLDER);
		}

		const world = await unitOfWork.worldRepository.findById(folder.world);
		await archive.worldRepository.create(world);

		await this.addWikiFolder(context, folder, archive, unitOfWork, errorOut);

		return folder.name;
	};

	private addWikiFolder = async (
		context: SecurityContext,
		folder: WikiFolder,
		archive: Archive,
		unitOfWork: UnitOfWork,
		errorOut = false
	) => {
		if (!(await folder.authorizationPolicy.canRead(context, unitOfWork))) {
			if (errorOut) {
				throw new ReadPermissionDeniedError(folder._id, WIKI_FOLDER);
			}
			return;
		}

		for (let pageId of folder.pages) {
			const page = await unitOfWork.wikiPageRepository.findById(pageId);
			await this.exportWikiPage(context, pageId, page.type, archive, unitOfWork);
		}

		for (let childId of folder.children) {
			const child = await unitOfWork.wikiFolderRepository.findById(childId);
			await this.addWikiFolder(context, child, archive, unitOfWork, false);
		}

		await archive.wikiFolderRepository.create(folder);
	};

	private addImage = async (
		context: SecurityContext,
		image: Image,
		archive: Archive,
		unitOfWork: UnitOfWork
	) => {
		if (image.icon) {
			const icon = await unitOfWork.imageRepository.findById(image.icon);
			await this.addImage(context, icon, archive, unitOfWork);
		}
		const chunks: Chunk[] = await unitOfWork.chunkRepository.find([
			new FilterCondition("_id", image.chunks, FILTER_CONDITION_OPERATOR_IN),
		]);
		for (let chunk of chunks) {
			await archive.chunkRepository.create(chunk);
			const file = await unitOfWork.fileRepository.findById(chunk.fileId);
			await this.addFile(file, archive);
		}
		await archive.imageRepository.create(image);
	};

	private addModel = async (
		context: SecurityContext,
		page: Model,
		archive: Archive,
		unitOfWork: UnitOfWork,
		errorOut = false
	) => {
		if (!(await page.authorizationPolicy.canRead(context, unitOfWork))) {
			if (errorOut) {
				return new ReadPermissionDeniedError(page._id, MODEL);
			}
			return;
		}
		await archive.modelRepository.create(page);
		if (page.fileId) {
			const file = await unitOfWork.fileRepository.findById(page.fileId);
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
		unitOfWork: UnitOfWork
	) => {
		if (page.pageModel) {
			const model = await unitOfWork.modelRepository.findById(page.pageModel);
			await this.addModel(context, model, archive, unitOfWork);
		}
	};

	private addWikiPageRelationships = async (
		context: SecurityContext,
		page: WikiPage,
		archive: Archive,
		unitOfWork: UnitOfWork
	) => {
		if (page.coverImage) {
			const image = await unitOfWork.imageRepository.findById(page.coverImage);
			await this.addImage(context, image, archive, unitOfWork);
		}
		if (page.contentId) {
			const file = await unitOfWork.fileRepository.findById(page.contentId);
			await this.addFile(file, archive);
		}
		const world = await unitOfWork.worldRepository.findById(page.world);
		await archive.worldRepository.create(world);
	};
}
