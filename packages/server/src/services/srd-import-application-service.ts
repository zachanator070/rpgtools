import { ImageService, SrdImportService, UnitOfWork } from "../types";
import { World } from "../domain-entities/world";
import { Readable } from "stream";
import {
	Open5eApiClient,
	Open5eMonster,
	Open5eRuleSection,
} from "../five-e-import/open-5e-api-client";
import fetch from "node-fetch";
import { Article } from "../domain-entities/article";
import { WikiFolder } from "../domain-entities/wiki-folder";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../injectable-types";
import { FILTER_CONDITION_OPERATOR_IN, FilterCondition } from "../dal/filter-condition";
import { WikiFolderAuthorizationRuleset } from "../security/wiki-folder-authorization-ruleset";
import { SecurityContext } from "../security-context";
import { File } from "../domain-entities/file";
import { DeltaFactory } from "../five-e-import/delta-factory";
import { Monster } from "../domain-entities/monster";
import { DbUnitOfWork } from "../dal/db-unit-of-work";

@injectable()
export class SrdImportApplicationService implements SrdImportService {
	@inject(INJECTABLE_TYPES.ImageService)
	imageService: ImageService;
	@inject(INJECTABLE_TYPES.Open5eApiClient)
	open5eApiClient: Open5eApiClient;

	wikiFolderAuthorizationRuleset: WikiFolderAuthorizationRuleset = new WikiFolderAuthorizationRuleset();

	deltaFactory: DeltaFactory = new DeltaFactory();

	import5eSrd = async (
		context: SecurityContext,
		worldId: string,
		importCreatureCodex: boolean,
		importTomeOfBeasts: boolean
	): Promise<void> => {
		const unitOfWork = new DbUnitOfWork();
		const world = await unitOfWork.worldRepository.findById(worldId);
		if (!world) {
			throw new Error("World does not exist");
		}
		const rootFolder = await unitOfWork.wikiFolderRepository.findById(world.rootFolder);
		if (!(await this.wikiFolderAuthorizationRuleset.canWrite(context, rootFolder))) {
			throw new Error("You do not have permission to add a top level folder");
		}
		const topFolder = new WikiFolder("", "5e", worldId, [], []);
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
	};

	createSubFolder = async (
		topFolder: WikiFolder,
		name: string,
		world: World,
		unitOfWork: UnitOfWork
	) => {
		const subFolder = new WikiFolder("", name, world._id, [], []);
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
		const file = new File("", filename, readStream);
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
			const monsterPage = new Monster("", monster.name, containingFolder.world, "", "", "", "");
			if (monster.img_main) {
				const imageResponse = await fetch(monster.img_main);
				const coverImage = await this.imageService.createImage(
					containingFolder.world,
					false,
					monster.img_main,
					Readable.from(imageResponse.body)
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
			const page = new Article("", article.name, topFolder.world, "", "");
			await unitOfWork.articleRepository.create(page);
			const content = this.deltaFactory.fromSection(article);
			const contentFile = await this.createWikiContentFile(
				page._id,
				JSON.stringify(content),
				unitOfWork
			);
			page.contentId = contentFile._id;
			await unitOfWork.articleRepository.update(page);
			const containingFolder = folders.find((folder) => folder.name === article.parent);
			if (!containingFolder) {
				const containingFolder = new WikiFolder("", article.parent, topFolder.world, [], []);
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
			const page = new Article("", article.name, containingFolder.world, "", "");
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
			const page = new Article("", article.name, containingFolder.world, "", "");
			await unitOfWork.articleRepository.create(page);
			const content = this.deltaFactory.fromCharacterClass(article, containingFolder.world);
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
			const page = new Article("", article.name, containingFolder.world, "", "");
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
		for await (let rule of this.open5eApiClient.getRules()) {
			const page = new Article("", rule.name, containingFolder.world, "", "");
			await unitOfWork.articleRepository.create(page);
			const subSections: Open5eRuleSection[] = [];
			for (let section of rule.subsections) {
				subSections.push(await this.open5eApiClient.getRuleSubSection(section.index));
			}
			const content = this.deltaFactory.fromRule(rule, subSections);
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
