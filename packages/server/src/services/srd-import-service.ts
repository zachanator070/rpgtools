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
import { SecurityContext } from "../security/security-context";
import { File } from "../domain-entities/file";
import { DeltaFactory } from "../five-e-import/delta-factory";
import {Dnd5eApiClient } from "../five-e-import/dnd-5e-api-client";
import {ImageService} from "./image-service";
import {DatabaseContext} from "../dal/database-context";
import ArticleFactory from "../domain-entities/factory/article-factory";
import WikiFolderFactory from "../domain-entities/factory/wiki-folder-factory";
import MonsterFactory from "../domain-entities/factory/monster-factory";
import FileFactory from "../domain-entities/factory/file-factory";

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

		// have to do these in series before import b/c of race condition where rootFolder.save was throwing ParallelSaveError
		const monsterFolder = await this.createSubFolder(topFolder, "Monsters", world, databaseContext);
		const racesFolder = await this.createSubFolder(topFolder, "Races", world, databaseContext);
		const classesFolder = await this.createSubFolder(topFolder, "Classes", world, databaseContext);
		const spellsFolder = await this.createSubFolder(topFolder, "Spells", world, databaseContext);

		await Promise.all([
			this.importMonsters(monsterFolder, importCreatureCodex, importTomeOfBeasts, databaseContext),
			(async () => {
				await this.importAdventurePages(topFolder, databaseContext);
				// adventure pages creates a rules folder that importRules needs
				const rulesFolder = (
					await databaseContext.wikiFolderRepository.findByIds(topFolder.children)
				).find((folder) => folder.name === "Rules");
				await this.importRules(rulesFolder, databaseContext);
			})(),
			this.importRaces(racesFolder, databaseContext),
			(async () => {
				await this.importSpells(spellsFolder, databaseContext);
				// spells are required to be populated before classes can be imported
				await this.importClasses(classesFolder, databaseContext);
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
		databaseContext: DatabaseContext
	) => {
		const subFolder = this.wikiFolderFactory.build({name, world: world._id, pages: [], children: [], acl: []});
		await databaseContext.wikiFolderRepository.create(subFolder);
		topFolder.children.push(subFolder._id);
		await databaseContext.wikiFolderRepository.update(topFolder);
		return subFolder;
	};

	createWikiContentFile = async (
		wikiId: string,
		content: string,
		databaseContext: DatabaseContext
	): Promise<File> => {
		const readStream = Readable.from(Buffer.from(content));
		const filename = `wikiContent.${wikiId}`;
		const file = this.fileFactory.build({filename, readStream, mimeType: 'application/json'});
		await databaseContext.fileRepository.create(file);
		return file;
	};

	importMonsters = async (
		containingFolder: WikiFolder,
		creatureCodex: boolean,
		tomeOfBeasts: boolean,
		databaseContext: DatabaseContext
	) => {
		const filter = (monster: Open5eMonster) =>
			(monster.document__slug === "cc" && creatureCodex) ||
			(monster.document__slug === "tob" && tomeOfBeasts) ||
			monster.document__slug === "wotc-srd";
		for await (let monster of this.open5eApiClient.getMonsters()) {
			if (!filter(monster)) {
				continue;
			}
			const monsterPage = this.monsterFactory.build(
				{
					name: monster.name,
					world: containingFolder.world,
					coverImage: null,
					contentId: null,
					pageModel: null,
					modelColor: null,
					acl: []
				}
			);
			if (monster.img_main) {
				const imageResponse = await fetch(monster.img_main);
				const coverImage = await this.imageService.createImage(
					containingFolder.world,
					false,
					monster.img_main,
					Readable.from(imageResponse.body),
					databaseContext
				);
				monsterPage.coverImage = coverImage._id;
			}
			await databaseContext.monsterRepository.create(monsterPage);
			const content = this.deltaFactory.fromMonster(monster);
			const contentFile = await this.createWikiContentFile(
				monsterPage._id,
				JSON.stringify(content),
				databaseContext
			);
			monsterPage.contentId = contentFile._id;
			await databaseContext.monsterRepository.update(monsterPage);
			containingFolder.pages.push(monsterPage._id);
			await databaseContext.wikiFolderRepository.update(containingFolder);
		}
	};

	importAdventurePages = async (topFolder: WikiFolder, databaseContext: DatabaseContext) => {
		const folders: WikiFolder[] = [];
		for await (let article of this.open5eApiClient.getAdventuringSections()) {
			const page = this.articleFactory.build({name: article.name, world: topFolder.world, coverImage: null, contentId: null, acl: []});
			await databaseContext.articleRepository.create(page);
			const content = this.deltaFactory.fromSection(article);
			const contentFile = await this.createWikiContentFile(
				page._id,
				JSON.stringify(content),
				databaseContext
			);
			page.contentId = contentFile._id;
			await databaseContext.articleRepository.update(page);
			let containingFolder = folders.find((folder) => folder.name === article.parent);
			if (!containingFolder) {
				containingFolder = this.wikiFolderFactory.build(
					{
						name: article.parent,
						world: topFolder.world,
						pages: [],
						children: [],
						acl: []
					}
				);
				await databaseContext.wikiFolderRepository.create(containingFolder);
				topFolder.children.push(containingFolder._id);
				await databaseContext.wikiFolderRepository.update(topFolder);
				folders.push(containingFolder);
			}
			containingFolder.pages.push(page._id);
			await databaseContext.wikiFolderRepository.update(containingFolder);
		}
	};

	importRaces = async (containingFolder: WikiFolder, databaseContext: DatabaseContext) => {
		for await (let article of this.open5eApiClient.getRaces()) {
			const page = this.articleFactory.build({name: article.name, world: containingFolder.world, coverImage: null, contentId: null, acl: []});
			await databaseContext.articleRepository.create(page);
			const content = this.deltaFactory.fromRace(article);
			const contentFile = await this.createWikiContentFile(
				page._id,
				JSON.stringify(content),
				databaseContext
			);
			page.contentId = contentFile._id;
			await databaseContext.articleRepository.update(page);
			containingFolder.pages.push(page._id);
			await databaseContext.wikiFolderRepository.update(containingFolder);
		}
	};

	importClasses = async (containingFolder: WikiFolder, databaseContext: DatabaseContext) => {
		for await (let article of this.open5eApiClient.getClasses()) {
			const page = this.articleFactory.build({name: article.name, world: containingFolder.world, coverImage: null, contentId: null, acl: []});
			await databaseContext.articleRepository.create(page);
			const content = this.deltaFactory.fromCharacterClass(article, containingFolder.world, databaseContext);
			const contentFile = await this.createWikiContentFile(
				page._id,
				JSON.stringify(content),
				databaseContext
			);
			page.contentId = contentFile._id;
			await databaseContext.articleRepository.update(page);
			containingFolder.pages.push(page._id);
			await databaseContext.wikiFolderRepository.update(containingFolder);
		}
	};

	importSpells = async (containingFolder: WikiFolder, databaseContext: DatabaseContext) => {
		for await (let article of this.open5eApiClient.getSpells()) {
			const page = this.articleFactory.build({name: article.name, world: containingFolder.world, coverImage: null, contentId: null, acl: []});
			await databaseContext.articleRepository.create(page);
			const content = this.deltaFactory.fromSpell(article);
			const contentFile = await this.createWikiContentFile(
				page._id,
				JSON.stringify(content),
				databaseContext
			);
			page.contentId = contentFile._id;
			await databaseContext.articleRepository.update(page);
			containingFolder.pages.push(page._id);
			await databaseContext.wikiFolderRepository.update(containingFolder);
		}
	};

	importRules = async (containingFolder: WikiFolder, databaseContext: DatabaseContext) => {
		for (let rule of await this.dnd5eApiClient.getRules()) {
			const page = this.articleFactory.build({name: rule.name, world: containingFolder.world, coverImage: null, contentId: null, acl: []});
			await databaseContext.articleRepository.create(page);
			const content = this.deltaFactory.fromRule(rule);
			const contentFile = await this.createWikiContentFile(
				page._id,
				JSON.stringify(content),
				databaseContext
			);
			page.contentId = contentFile._id;
			await databaseContext.articleRepository.update(page);
			containingFolder.pages.push(page._id);
			await databaseContext.wikiFolderRepository.update(containingFolder);
		}
	};
}
