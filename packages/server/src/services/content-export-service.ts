import {
	ApplicationService,
	ArticleRepository,
	ChunkRepository,
	FileRepository,
	ImageRepository,
	ItemRepository,
	ModelRepository,
	MonsterRepository,
	PersonRepository,
	PlaceRepository,
	Repository,
	UnitOfWork,
	WikiFolderRepository,
	WikiPageRepository,
	WorldRepository,
} from "../types";
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
import { inject } from "inversify";
import { INJECTABLE_TYPES } from "../injectable-types";
import { SecurityContext } from "../security-context";
import { EntityNotFoundError, ReadPermissionDeniedError, TypeNotSupportedError } from "../errors";
import { WikiPageAuthorizationRuleset } from "../security/wiki-page-authorization-ruleset";
import { Place } from "../domain-entities/place";
import { ModeledPage } from "../domain-entities/modeled-page";
import { Image } from "../domain-entities/image";
import { Chunk } from "../domain-entities/chunk.";
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

export class ContentExportService implements ApplicationService {
	@inject(INJECTABLE_TYPES.WikiPageRepository)
	wikiPageRepository: WikiPageRepository;
	@inject(INJECTABLE_TYPES.WikiFolderRepository)
	wikiFolderRepository: WikiFolderRepository;
	@inject(INJECTABLE_TYPES.WorldRepository)
	worldRepository: WorldRepository;
	@inject(INJECTABLE_TYPES.ImageRepository)
	imageRepository: ImageRepository;
	@inject(INJECTABLE_TYPES.ChunkRepository)
	chunkRepository: ChunkRepository;
	@inject(INJECTABLE_TYPES.ModelRepository)
	modelRepository: ModelRepository;
	@inject(INJECTABLE_TYPES.PlaceRepository)
	placeRepository: PlaceRepository;
	@inject(INJECTABLE_TYPES.ItemRepository)
	itemRepository: ItemRepository;
	@inject(INJECTABLE_TYPES.MonsterRepository)
	monsterRepository: MonsterRepository;
	@inject(INJECTABLE_TYPES.PersonRepository)
	personRepository: PersonRepository;
	@inject(INJECTABLE_TYPES.ArticleRepository)
	articleRepository: ArticleRepository;
	@inject(INJECTABLE_TYPES.FileRepository)
	fileRepository: FileRepository;

	wikiPageAuthorizationRuleSet: WikiPageAuthorizationRuleset = new WikiPageAuthorizationRuleset();
	modelAuthorizationRuleset: ModelAuthorizationRuleset = new ModelAuthorizationRuleset();
	wikiFolderAuthorizationRuleset: WikiFolderAuthorizationRuleset = new WikiFolderAuthorizationRuleset();

	public exportWikiPage = async (
		context: SecurityContext,
		docId: string,
		wikiType: string,
		unitOfWork: UnitOfWork
	) => {
		let page = await this.wikiPageRepository.findById(docId);
		if (!page) {
			throw new EntityNotFoundError(docId, WIKI_PAGE);
		}
		if (wikiType === ARTICLE) {
			page = await this.articleRepository.findById(docId);
			await this.addArticle(context, page, unitOfWork, true);
		} else if (wikiType === PLACE) {
			page = await this.placeRepository.findById(docId);
			await this.addPlace(context, page, unitOfWork, true);
		} else if (wikiType === ITEM) {
			page = await this.itemRepository.findById(docId);
			await this.addItem(context, page, unitOfWork, true);
		} else if (wikiType === MONSTER) {
			page = await this.monsterRepository.findById(docId);
			await this.addMonster(context, page, unitOfWork, true);
		} else if (wikiType === PERSON) {
			page = await this.personRepository.findById(docId);
			await this.addPerson(context, page, unitOfWork, true);
		} else {
			throw new TypeNotSupportedError(wikiType);
		}
	};

	public exportModel = async (context: SecurityContext, docId: string, unitOfWork: UnitOfWork) => {
		const model = await this.modelRepository.findById(docId);
		if (!model) {
			throw new EntityNotFoundError(docId, MODEL);
		}
		await this.addModel(context, model, unitOfWork, true);
	};

	public exportWikiFolder = async (
		context: SecurityContext,
		docId: string,
		unitOfWork: UnitOfWork,
		errorOut: boolean = true
	) => {
		const folder = await this.wikiFolderRepository.findById(docId);
		if (!folder) {
			throw new EntityNotFoundError(docId, WIKI_FOLDER);
		}

		const world = await this.worldRepository.findById(folder.world);
		await unitOfWork.worldRepository.create(world);

		await this.addWikiFolder(context, folder, unitOfWork, errorOut);

		for (let pageId of folder.pages) {
			const articles = await this.articleRepository.find([
				new FilterCondition("_id", folder.pages, FILTER_CONDITION_OPERATOR_IN),
			]);
			for (let article of articles) {
				await this.addArticle(context, article, unitOfWork, false);
			}
			const items = await this.itemRepository.find([
				new FilterCondition("_id", folder.pages, FILTER_CONDITION_OPERATOR_IN),
			]);
			for (let item of items) {
				await this.addItem(context, item, unitOfWork, false);
			}
			const monsters = await this.monsterRepository.find([
				new FilterCondition("_id", folder.pages, FILTER_CONDITION_OPERATOR_IN),
			]);
			for (let monster of monsters) {
				await this.addMonster(context, monster, unitOfWork, false);
			}
			const persons = await this.personRepository.find([
				new FilterCondition("_id", folder.pages, FILTER_CONDITION_OPERATOR_IN),
			]);
			for (let person of persons) {
				await this.addPerson(context, person, unitOfWork, false);
			}
			const places = await this.placeRepository.find([
				new FilterCondition("_id", folder.pages, FILTER_CONDITION_OPERATOR_IN),
			]);
			for (let place of places) {
				await this.addPlace(context, place, unitOfWork, false);
			}
		}
		for (let childId of folder.children) {
			await this.exportWikiFolder(context, docId, unitOfWork, false);
		}
	};

	private addWikiFolder = async (
		context: SecurityContext,
		folder: WikiFolder,
		unitOfWork: UnitOfWork,
		errorOut: boolean = false
	) => {
		if (!(await this.wikiFolderAuthorizationRuleset.canRead(context, folder))) {
			if (errorOut) {
				throw new ReadPermissionDeniedError(folder._id, WIKI_FOLDER);
			}
			return;
		}
		await unitOfWork.wikiFolderRepository.create(folder);
	};

	private addImage = async (context: SecurityContext, image: Image, unitOfWork: UnitOfWork) => {
		if (image.icon) {
			const icon = await this.imageRepository.findById(image.icon);
			await this.addImage(context, icon, unitOfWork);
		}
		const chunks: Chunk[] = await this.chunkRepository.find([
			new FilterCondition("_id", image.chunks, FILTER_CONDITION_OPERATOR_IN),
		]);
		for (let chunk of chunks) {
			await unitOfWork.chunkRepository.create(chunk);
			const file = await this.fileRepository.findById(chunk.fileId);
			await this.addFile(file, unitOfWork);
		}
	};

	private addModel = async (
		context: SecurityContext,
		page: Model,
		unitOfWork: UnitOfWork,
		errorOut: boolean = false
	) => {
		if (!(await this.modelAuthorizationRuleset.canRead(context, page))) {
			if (errorOut) {
				return new ReadPermissionDeniedError(page._id, MODEL);
			}
			return;
		}
		await unitOfWork.modelRepository.create(page);
		if (page.fileId) {
			const file = await this.fileRepository.findById(page.fileId);
			await this.addFile(file, unitOfWork);
		}
	};

	private addFile = async (file: File, unitOfWork: UnitOfWork) => {
		await unitOfWork.fileRepository.create(file);
	};

	private addPlace = async (
		context: SecurityContext,
		page: Place,
		unitOfWork: UnitOfWork,
		errorOut: boolean = false
	) => {
		if (await this.canReadWikiPage(context, page, errorOut)) {
			if (page.mapImage) {
				const image = await this.imageRepository.findById(page.mapImage);
				await this.addImage(context, image, unitOfWork);
			}
			await this.placeRepository.create(page);
			await this.addWikiPageRelationships(context, page, unitOfWork);
		}
	};

	private addItem = async (
		context: SecurityContext,
		page: Item,
		unitOfWork: UnitOfWork,
		errorOut: boolean = false
	) => {
		if (await this.canReadWikiPage(context, page, errorOut)) {
			await this.addModeledWikiPageRelationships(context, page, unitOfWork);
			await unitOfWork.itemRepository.create(page);
			await this.addWikiPageRelationships(context, page, unitOfWork);
		}
	};

	private addMonster = async (
		context: SecurityContext,
		page: Monster,
		unitOfWork: UnitOfWork,
		errorOut: boolean = false
	) => {
		if (await this.canReadWikiPage(context, page, errorOut)) {
			await this.addModeledWikiPageRelationships(context, page, unitOfWork);
			await unitOfWork.monsterRepository.create(page);
			await this.addWikiPageRelationships(context, page, unitOfWork);
		}
	};

	private addPerson = async (
		context: SecurityContext,
		page: Person,
		unitOfWork: UnitOfWork,
		errorOut: boolean = false
	) => {
		if (await this.canReadWikiPage(context, page, errorOut)) {
			await this.addModeledWikiPageRelationships(context, page, unitOfWork);
			await unitOfWork.personRepository.create(page);
			await this.addWikiPageRelationships(context, page, unitOfWork);
		}
	};

	private addModeledWikiPageRelationships = async (
		context: SecurityContext,
		page: ModeledPage,
		unitOfWork: UnitOfWork
	) => {
		if (page.model) {
			const model = await this.modelRepository.findById(page.model);
			await this.addModel(context, model, unitOfWork);
		}
	};

	private addArticle = async (
		context: SecurityContext,
		page: Article,
		unitOfWork: UnitOfWork,
		errorOut: boolean = false
	) => {
		if (await this.canReadWikiPage(context, page, errorOut)) {
			await unitOfWork.articleRepository.create(page);
			await this.addWikiPageRelationships(context, page, unitOfWork);
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
		unitOfWork: UnitOfWork
	) => {
		if (page.coverImage) {
			const image = await this.imageRepository.findById(page.coverImage);
			await this.addImage(context, image, unitOfWork);
			if (image.icon) {
				const icon = await this.imageRepository.findById(image.icon);
				await this.addImage(context, icon, unitOfWork);
			}
		}
		if (page.contentId) {
			const file = await this.fileRepository.findById(page.contentId);
			await this.addFile(file, unitOfWork);
		}
		const world = await this.worldRepository.findById(page.world);
		await unitOfWork.worldRepository.create(world);
	};
}
