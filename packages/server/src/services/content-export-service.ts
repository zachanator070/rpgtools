import { Archive, UnitOfWork } from "../types";
import {
	ARTICLE,
	ITEM,
	MODEL,
	MONSTER,
	PERSON,
	PLACE,
	WIKI_FOLDER,
	WIKI_PAGE,
} from "@rpgtools/common/src/type-constants";
import { WikiPage } from "../domain-entities/wiki-page";
import { SecurityContext } from "../security/security-context";
import { EntityNotFoundError, ReadPermissionDeniedError, TypeNotSupportedError } from "../errors";
import { Place } from "../domain-entities/place";
import { ModeledPage } from "../domain-entities/modeled-page";
import { Image } from "../domain-entities/image";
import { Chunk } from "../domain-entities/chunk";
import { Item } from "../domain-entities/item";
import { Monster } from "../domain-entities/monster";
import { Person } from "../domain-entities/person";
import { Article } from "../domain-entities/article";
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
		if (wikiType === ARTICLE) {
			page = await unitOfWork.articleRepository.findById(docId);
			await this.addArticle(context, page, archive, unitOfWork, true);
		} else if (wikiType === PLACE) {
			page = await unitOfWork.placeRepository.findById(docId);
			await this.addPlace(context, page as Place, archive, unitOfWork, true);
		} else if (wikiType === ITEM) {
			page = await unitOfWork.itemRepository.findById(docId);
			await this.addItem(context, page as Item, archive, unitOfWork, true);
		} else if (wikiType === MONSTER) {
			page = await unitOfWork.monsterRepository.findById(docId);
			await this.addMonster(context, page as Monster, archive, unitOfWork, true);
		} else if (wikiType === PERSON) {
			page = await unitOfWork.personRepository.findById(docId);
			await this.addPerson(context, page as Person, archive, unitOfWork, true);
		} else {
			throw new TypeNotSupportedError(wikiType);
		}
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

		const articles = await unitOfWork.articleRepository.find([
			new FilterCondition("_id", folder.pages, FILTER_CONDITION_OPERATOR_IN),
		]);
		for (let article of articles) {
			await this.addArticle(context, article, archive, unitOfWork, false);
		}
		const items = await unitOfWork.itemRepository.find([
			new FilterCondition("_id", folder.pages, FILTER_CONDITION_OPERATOR_IN),
		]);
		for (let item of items) {
			await this.addItem(context, item, archive, unitOfWork, false);
		}
		const monsters = await unitOfWork.monsterRepository.find([
			new FilterCondition("_id", folder.pages, FILTER_CONDITION_OPERATOR_IN),
		]);
		for (let monster of monsters) {
			await this.addMonster(context, monster, archive, unitOfWork, false);
		}
		const persons = await unitOfWork.personRepository.find([
			new FilterCondition("_id", folder.pages, FILTER_CONDITION_OPERATOR_IN),
		]);
		for (let person of persons) {
			await this.addPerson(context, person, archive, unitOfWork, false);
		}
		const places = await unitOfWork.placeRepository.find([
			new FilterCondition("_id", folder.pages, FILTER_CONDITION_OPERATOR_IN),
		]);
		for (let place of places) {
			await this.addPlace(context, place, archive, unitOfWork, false);
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
		if (!(await page.authorizationPolicy.canRead(context))) {
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

	private addPlace = async (
		context: SecurityContext,
		page: Place,
		archive: Archive,
		unitOfWork: UnitOfWork,
		errorOut = false
	) => {
		if (await this.canReadWikiPage(context, page, unitOfWork, errorOut)) {
			if (page.mapImage) {
				const image = await unitOfWork.imageRepository.findById(page.mapImage);
				await this.addImage(context, image, archive, unitOfWork);
			}
			await archive.placeRepository.create(page);
			await this.addWikiPageRelationships(context, page, archive, unitOfWork);
		}
	};

	private addItem = async (
		context: SecurityContext,
		page: Item,
		archive: Archive,
		unitOfWork: UnitOfWork,
		errorOut = false
	) => {
		if (await this.canReadWikiPage(context, page, unitOfWork, errorOut)) {
			await this.addModeledWikiPageRelationships(context, page, archive, unitOfWork);
			await archive.itemRepository.create(page);
			await this.addWikiPageRelationships(context, page, archive, unitOfWork);
		}
	};

	private addMonster = async (
		context: SecurityContext,
		page: Monster,
		archive: Archive,
		unitOfWork: UnitOfWork,
		errorOut = false
	) => {
		if (await this.canReadWikiPage(context, page, unitOfWork, errorOut)) {
			await this.addModeledWikiPageRelationships(context, page, archive, unitOfWork);
			await archive.monsterRepository.create(page);
			await this.addWikiPageRelationships(context, page, archive, unitOfWork);
		}
	};

	private addPerson = async (
		context: SecurityContext,
		page: Person,
		archive: Archive,
		unitOfWork: UnitOfWork,
		errorOut = false
	) => {
		if (await this.canReadWikiPage(context, page, unitOfWork, errorOut)) {
			await this.addModeledWikiPageRelationships(context, page, archive, unitOfWork);
			await archive.personRepository.create(page);
			await this.addWikiPageRelationships(context, page, archive, unitOfWork);
		}
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

	private addArticle = async (
		context: SecurityContext,
		page: Article,
		archive: Archive,
		unitOfWork: UnitOfWork,
		errorOut = false
	) => {
		if (await this.canReadWikiPage(context, page, unitOfWork, errorOut)) {
			await archive.articleRepository.create(page);
			await this.addWikiPageRelationships(context, page, archive, unitOfWork);
		}
	};

	private canReadWikiPage = async (context: SecurityContext, page: WikiPage, unitOfWork: UnitOfWork, errorOut = false) => {
		if (!(await page.authorizationPolicy.canRead(context, unitOfWork))) {
			if (errorOut) {
				return new ReadPermissionDeniedError(page._id, WIKI_PAGE);
			}
			return false;
		}
		return true;
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
