import {
	ArticleFactory,
	Factory,
	FileFactory,
	MonsterFactory,
	UnitOfWork,
	WikiFolderFactory,
} from "../types";
import { World } from "../domain-entities/world";
import { Readable } from "stream";
import {
	Open5eApiClient,
	Open5eMonster,
} from "../five-e-import/open-5e-api-client";
import fetch from "node-fetch";
import { WikiFolder } from "../domain-entities/wiki-folder";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import { FILTER_CONDITION_OPERATOR_IN, FilterCondition } from "../dal/filter-condition";
import { SecurityContext } from "../security/security-context";
import { File } from "../domain-entities/file";
import { DeltaFactory } from "../five-e-import/delta-factory";
import {Dnd5eApiClient } from "../five-e-import/dnd-5e-api-client";
import {ImageService} from "./image-service";

@injectable()
export class SrdImportService {
	@inject(INJECTABLE_TYPES.ImageService)
	imageService: ImageService;
	@inject(INJECTABLE_TYPES.Open5eApiClient)
	open5eApiClient: Open5eApiClient;
	@inject(INJECTABLE_TYPES.Dnd5eApiClient)
	dnd5eApiClient: Dnd5eApiClient;

	@inject(INJECTABLE_TYPES.ArticleFactory)
	articleFactory: ArticleFactory;
	@inject(INJECTABLE_TYPES.WikiFolderFactory)
	wikiFolderFactory: WikiFolderFactory;
	@inject(INJECTABLE_TYPES.MonsterFactory)
	monsterFactory: MonsterFactory;
	@inject(INJECTABLE_TYPES.FileFactory)
	fileFactory: FileFactory;

	@inject(INJECTABLE_TYPES.DeltaFactory)
	deltaFactory: DeltaFactory;

	import5eSrd = async (
		context: SecurityContext,
		worldId: string,
		importCreatureCodex: boolean,
		importTomeOfBeasts: boolean,
		unitOfWork: UnitOfWork
	): Promise<World> => {
		const world = await unitOfWork.worldRepository.findById(worldId);
		if (!world) {
			throw new Error("World does not exist");
		}
		const rootFolder = await unitOfWork.wikiFolderRepository.findById(world.rootFolder);
		if (!(await rootFolder.authorizationPolicy.canWrite(context))) {
			throw new Error("You do not have permission to add a top level folder");
		}
		const topFolder = this.wikiFolderFactory({_id: null, name: "5e", world: worldId, pages: [], children: []});
		await unitOfWork.wikiFolderRepository.create(topFolder);
		rootFolder.children.push(topFolder._id);
		await unitOfWork.wikiFolderRepository.update(rootFolder);

		// have to do these in series before import b/c of race condition where rootFolder.save was throwing ParallelSaveError
		const monsterFolder = await this.createSubFolder(topFolder, "Monsters", world, unitOfWork);
		const racesFolder = await this.createSubFolder(topFolder, "Races", world, unitOfWork);
		const classesFolder = await this.createSubFolder(topFolder, "Classes", world, unitOfWork);
		const spellsFolder = await this.createSubFolder(topFolder, "Spells", world, unitOfWork);

		await Promise.all([
			this.importMonsters(monsterFolder, importCreatureCodex, importTomeOfBeasts, unitOfWork),
			(async () => {
				await this.importAdventurePages(topFolder, unitOfWork);
				// adventure pages creates a rules folder that importRules needs
				const rulesFolder = (
					await unitOfWork.wikiFolderRepository.find([
						new FilterCondition("_id", topFolder.children, FILTER_CONDITION_OPERATOR_IN),
					])
				).find((folder) => folder.name === "Rules");
				await this.importRules(rulesFolder, unitOfWork);
			})(),
			this.importRaces(racesFolder, unitOfWork),
			(async () => {
				await this.importSpells(spellsFolder, unitOfWork);
				// spells are required to be populated before classes can be imported
				await this.importClasses(classesFolder, unitOfWork);
			})(),
		]).catch((err) => {
			console.warn(err);
		});

		return world;
	};

	createSubFolder = async (
		topFolder: WikiFolder,
		name: string,
		world: World,
		unitOfWork: UnitOfWork
	) => {
		const subFolder = this.wikiFolderFactory({_id: null, name, world: world._id, pages: [], children: []});
		await unitOfWork.wikiFolderRepository.create(subFolder);
		topFolder.children.push(subFolder._id);
		await unitOfWork.wikiFolderRepository.update(topFolder);
		return subFolder;
	};

	createWikiContentFile = async (
		wikiId: string,
		content: string,
		unitOfWork: UnitOfWork
	): Promise<File> => {
		const readStream = Readable.from(content);
		const filename = `wikiContent.${wikiId}`;
		const file = this.fileFactory({_id: null, filename, readStream, mimeType: null});
		await unitOfWork.fileRepository.create(file);
		return file;
	};

	importMonsters = async (
		containingFolder: WikiFolder,
		creatureCodex: boolean,
		tomeOfBeasts: boolean,
		unitOfWork: UnitOfWork
	) => {
		const filter = (monster: Open5eMonster) =>
			(monster.document__slug === "cc" && creatureCodex) ||
			(monster.document__slug === "tob" && tomeOfBeasts) ||
			monster.document__slug === "wotc-srd";
		for await (let monster of this.open5eApiClient.getMonsters()) {
			if (!filter(monster)) {
				continue;
			}
			const monsterPage = this.monsterFactory(
				{
					_id: null,
					name: monster.name,
					world: containingFolder.world,
					coverImage: null,
					contentId: null,
					pageModel: null,
					modelColor: null
				}
			);
			if (monster.img_main) {
				const imageResponse = await fetch(monster.img_main);
				const coverImage = await this.imageService.createImage(
					containingFolder.world,
					false,
					monster.img_main,
					Readable.from(imageResponse.body),
					unitOfWork
				);
				monsterPage.coverImage = coverImage._id;
			}
			await unitOfWork.monsterRepository.create(monsterPage);
			const content = this.deltaFactory.fromMonster(monster);
			const contentFile = await this.createWikiContentFile(
				monsterPage._id,
				JSON.stringify(content),
				unitOfWork
			);
			monsterPage.contentId = contentFile._id;
			await unitOfWork.monsterRepository.update(monsterPage);
			containingFolder.pages.push(monsterPage._id);
			await unitOfWork.wikiFolderRepository.update(containingFolder);
		}
	};

	importAdventurePages = async (topFolder: WikiFolder, unitOfWork: UnitOfWork) => {
		const folders: WikiFolder[] = [];
		for await (let article of this.open5eApiClient.getAdventuringSections()) {
			const page = this.articleFactory({_id: null, name: article.name, world: topFolder.world, coverImage: null, contentId: null});
			await unitOfWork.articleRepository.create(page);
			const content = this.deltaFactory.fromSection(article);
			const contentFile = await this.createWikiContentFile(
				page._id,
				JSON.stringify(content),
				unitOfWork
			);
			page.contentId = contentFile._id;
			await unitOfWork.articleRepository.update(page);
			let containingFolder = folders.find((folder) => folder.name === article.parent);
			if (!containingFolder) {
				containingFolder = this.wikiFolderFactory(
					{
						_id: "",
						name: article.parent,
						world: topFolder.world,
						pages: [],
						children: []
					}
				);
				await unitOfWork.wikiFolderRepository.create(containingFolder);
				topFolder.children.push(containingFolder._id);
				await unitOfWork.wikiFolderRepository.update(topFolder);
				folders.push(containingFolder);
			}
			containingFolder.pages.push(page._id);
			await unitOfWork.wikiFolderRepository.update(containingFolder);
		}
	};

	importRaces = async (containingFolder: WikiFolder, unitOfWork: UnitOfWork) => {
		for await (let article of this.open5eApiClient.getRaces()) {
			const page = this.articleFactory({_id: null, name: article.name, world: containingFolder.world, coverImage: null, contentId: null});
			await unitOfWork.articleRepository.create(page);
			const content = this.deltaFactory.fromRace(article);
			const contentFile = await this.createWikiContentFile(
				page._id,
				JSON.stringify(content),
				unitOfWork
			);
			page.contentId = contentFile._id;
			await unitOfWork.articleRepository.update(page);
			containingFolder.pages.push(page._id);
			await unitOfWork.wikiFolderRepository.update(containingFolder);
		}
	};

	importClasses = async (containingFolder: WikiFolder, unitOfWork: UnitOfWork) => {
		for await (let article of this.open5eApiClient.getClasses()) {
			const page = this.articleFactory({_id: null, name: article.name, world: containingFolder.world, coverImage: null, contentId: null});
			await unitOfWork.articleRepository.create(page);
			const content = this.deltaFactory.fromCharacterClass(article, containingFolder.world, unitOfWork);
			const contentFile = await this.createWikiContentFile(
				page._id,
				JSON.stringify(content),
				unitOfWork
			);
			page.contentId = contentFile._id;
			await unitOfWork.articleRepository.update(page);
			containingFolder.pages.push(page._id);
			await unitOfWork.wikiFolderRepository.update(containingFolder);
		}
	};

	importSpells = async (containingFolder: WikiFolder, unitOfWork: UnitOfWork) => {
		for await (let article of this.open5eApiClient.getSpells()) {
			const page = this.articleFactory({_id: null, name: article.name, world: containingFolder.world, coverImage: null, contentId: null});
			await unitOfWork.articleRepository.create(page);
			const content = this.deltaFactory.fromSpell(article);
			const contentFile = await this.createWikiContentFile(
				page._id,
				JSON.stringify(content),
				unitOfWork
			);
			page.contentId = contentFile._id;
			await unitOfWork.articleRepository.update(page);
			containingFolder.pages.push(page._id);
			await unitOfWork.wikiFolderRepository.update(containingFolder);
		}
	};

	importRules = async (containingFolder: WikiFolder, unitOfWork: UnitOfWork) => {
		for (let rule of await this.dnd5eApiClient.getRules()) {
			const page = this.articleFactory({_id: "", name: rule.name, world: containingFolder.world, coverImage: null, contentId: null});
			await unitOfWork.articleRepository.create(page);
			const content = this.deltaFactory.fromRule(rule);
			const contentFile = await this.createWikiContentFile(
				page._id,
				JSON.stringify(content),
				unitOfWork
			);
			page.contentId = contentFile._id;
			await unitOfWork.articleRepository.update(page);
			containingFolder.pages.push(page._id);
			await unitOfWork.wikiFolderRepository.update(containingFolder);
		}
	};
}
