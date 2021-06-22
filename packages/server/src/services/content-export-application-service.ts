import { Archive, ContentExportService, UnitOfWork } from "../types";
import {
	ARTICLE,
	ITEM,
	MODEL,
	MONSTER,
	PERSON,
	PLACE,
	WIKI_FOLDER,
	WIKI_PAGE,
} from "../../../common/src/type-constants";
import { WikiPage } from "../domain-entities/wiki-page";
import { SecurityContext } from "../security-context";
import { EntityNotFoundError, ReadPermissionDeniedError, TypeNotSupportedError } from "../errors";
import { WikiPageAuthorizationRuleset } from "../security/wiki-page-authorization-ruleset";
import { Place } from "../domain-entities/place";
import { ModeledPage } from "../domain-entities/modeled-page";
import { Image } from "../domain-entities/image";
import { Chunk } from "../domain-entities/chunk";
import { Item } from "../domain-entities/item";
import { Monster } from "../domain-entities/monster";
import { Person } from "../domain-entities/person";
import { Article } from "../domain-entities/article";
import { ModelAuthorizationRuleset } from "../security/model-authorization-ruleset";
import { FILTER_CONDITION_OPERATOR_IN, FilterCondition } from "../dal/filter-condition";
import { WikiFolderAuthorizationRuleset } from "../security/wiki-folder-authorization-ruleset";
import { WikiFolder } from "../domain-entities/wiki-folder";
import { Model } from "../domain-entities/model";
import { File } from "../domain-entities/file";
import { DbUnitOfWork } from "../dal/db-unit-of-work";
import { injectable } from "inversify";

@injectable()
export class ContentExportApplicationService implements ContentExportService {
	wikiPageAuthorizationRuleSet: WikiPageAuthorizationRuleset = new WikiPageAuthorizationRuleset();
	modelAuthorizationRuleset: ModelAuthorizationRuleset = new ModelAuthorizationRuleset();
	wikiFolderAuthorizationRuleset: WikiFolderAuthorizationRuleset = new WikiFolderAuthorizationRuleset();

	public exportWikiPage = async (
		context: SecurityContext,
		docId: string,
		wikiType: string,
		archive: Archive
	): Promise<void> => {
		const unitOfWork = new DbUnitOfWork();
		let page = await unitOfWork.wikiPageRepository.findById(docId);
		if (!page) {
			throw new EntityNotFoundError(docId, WIKI_PAGE);
		}
		if (wikiType === ARTICLE) {
			page = await unitOfWork.articleRepository.findById(docId);
			await this.addArticle(context, page, archive, unitOfWork, true);
		} else if (wikiType === PLACE) {
			page = await unitOfWork.placeRepository.findById(docId);
			await this.addPlace(context, page, archive, unitOfWork, true);
		} else if (wikiType === ITEM) {
			page = await unitOfWork.itemRepository.findById(docId);
			await this.addItem(context, page, archive, unitOfWork, true);
		} else if (wikiType === MONSTER) {
			page = await unitOfWork.monsterRepository.findById(docId);
			await this.addMonster(context, page, archive, unitOfWork, true);
		} else if (wikiType === PERSON) {
			page = await unitOfWork.personRepository.findById(docId);
			await this.addPerson(context, page, archive, unitOfWork, true);
		} else {
			throw new TypeNotSupportedError(wikiType);
		}
		await unitOfWork.commit();
	};

	public exportModel = async (context: SecurityContext, docId: string, archive: Archive) => {
		const unitOfWork = new DbUnitOfWork();
		const model = await unitOfWork.modelRepository.findById(docId);
		if (!model) {
			throw new EntityNotFoundError(docId, MODEL);
		}
		await this.addModel(context, model, archive, unitOfWork, true);
		await unitOfWork.commit();
	};

	public exportWikiFolder = async (
		context: SecurityContext,
		docId: string,
		archive: Archive,
		errorOut = true
	) => {
		const unitOfWork = new DbUnitOfWork();
		const folder = await unitOfWork.wikiFolderRepository.findById(docId);
		if (!folder) {
			throw new EntityNotFoundError(docId, WIKI_FOLDER);
		}

		const world = await unitOfWork.worldRepository.findById(folder.world);
		await archive.worldRepository.create(world);

		await this.addWikiFolder(context, folder, archive, errorOut);

		for (let pageId of folder.pages) {
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
		}
		for (let childId of folder.children) {
			await this.exportWikiFolder(context, docId, archive, false);
		}
		await unitOfWork.commit();
	};

	private addWikiFolder = async (
		context: SecurityContext,
		folder: WikiFolder,
		archive: Archive,
		errorOut = false
	) => {
		if (!(await this.wikiFolderAuthorizationRuleset.canRead(context, folder))) {
			if (errorOut) {
				throw new ReadPermissionDeniedError(folder._id, WIKI_FOLDER);
			}
			return;
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
	};

	private addModel = async (
		context: SecurityContext,
		page: Model,
		archive: Archive,
		unitOfWork: UnitOfWork,
		errorOut = false
	) => {
		if (!(await this.modelAuthorizationRuleset.canRead(context, page))) {
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
		if (await this.canReadWikiPage(context, page, errorOut)) {
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
		if (await this.canReadWikiPage(context, page, errorOut)) {
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
		if (await this.canReadWikiPage(context, page, errorOut)) {
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
		if (await this.canReadWikiPage(context, page, errorOut)) {
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
		if (page.model) {
			const model = await unitOfWork.modelRepository.findById(page.model);
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
		if (await this.canReadWikiPage(context, page, errorOut)) {
			await archive.articleRepository.create(page);
			await this.addWikiPageRelationships(context, page, archive, unitOfWork);
		}
	};

	private canReadWikiPage = async (context: SecurityContext, page: WikiPage, errorOut = false) => {
		if (!(await this.wikiPageAuthorizationRuleSet.canRead(context, page))) {
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
			if (image.icon) {
				const icon = await unitOfWork.imageRepository.findById(image.icon);
				await this.addImage(context, icon, archive, unitOfWork);
			}
		}
		if (page.contentId) {
			const file = await unitOfWork.fileRepository.findById(page.contentId);
			await this.addFile(file, archive);
		}
		const world = await unitOfWork.worldRepository.findById(page.world);
		await archive.worldRepository.create(world);
	};
}
