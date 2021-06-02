import {
	ApplicationService,
	ArticleRepository,
	FileRepository,
	MonsterRepository,
	WikiFolderRepository,
	WorldRepository,
} from "../types";
import { World } from "../domain-entities/world";
import { Readable } from "stream";
import {
	Open5eApiClient,
	Open5eMonster,
	Open5eRuleSection,
} from "../five-e-import/open-5e-api-client";
import fetch from "node-fetch";
import { imageMutations } from "../resolvers/mutations/image-mutations";
import { Article } from "../domain-entities/article";
import { WikiFolder } from "../domain-entities/wiki-folder";
import { inject } from "inversify";
import { INJECTABLE_TYPES } from "../injectable-types";
import { FILTER_CONDITION_OPERATOR_IN, FilterCondition } from "../dal/filter-condition";
import { WikiFolderAuthorizationRuleset } from "../security/wiki-folder-authorization-ruleset";
import { SecurityContext } from "../security-context";
import { File } from "../domain-entities/file";
import { DeltaFactory } from "../five-e-import/delta-factory";
import { Monster } from "../domain-entities/monster";

export class SrdImportService implements ApplicationService {
	@inject(INJECTABLE_TYPES.WikiFolderRepository)
	wikiFolderRepository: WikiFolderRepository;
	@inject(INJECTABLE_TYPES.ArticleRepository)
	articleRepository: ArticleRepository;
	@inject(INJECTABLE_TYPES.WorldRepository)
	worldRepository: WorldRepository;
	@inject(INJECTABLE_TYPES.FileRepository)
	fileRepository: FileRepository;
	@inject(INJECTABLE_TYPES.MonsterRepository)
	monsterRepository: MonsterRepository;
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
		const world = await this.worldRepository.findById(worldId);
		if (!world) {
			throw new Error("World does not exist");
		}
		const rootFolder = await this.wikiFolderRepository.findById(world.rootFolder);
		if (!(await this.wikiFolderAuthorizationRuleset.canWrite(context, rootFolder))) {
			throw new Error("You do not have permission to add a top level folder");
		}
		const topFolder = new WikiFolder("", "5e", worldId, [], []);
		await this.wikiFolderRepository.create(topFolder);
		rootFolder.children.push(topFolder._id);
		await this.wikiFolderRepository.update(rootFolder);

		// have to do these in series before import b/c of race condition where rootFolder.save was throwing ParallelSaveError
		const monsterFolder = await this.createSubFolder(topFolder, "Monsters", world);
		const racesFolder = await this.createSubFolder(topFolder, "Races", world);
		const classesFolder = await this.createSubFolder(topFolder, "Classes", world);
		const spellsFolder = await this.createSubFolder(topFolder, "Spells", world);

		await Promise.all([
			this.importMonsters(monsterFolder, importCreatureCodex, importTomeOfBeasts),
			(async () => {
				await this.importAdventurePages(topFolder);
				// adventure pages creates a rules folder that importRules needs
				const rulesFolder = (
					await this.wikiFolderRepository.find([
						new FilterCondition("_id", topFolder.children, FILTER_CONDITION_OPERATOR_IN),
					])
				).find((folder) => folder.name === "Rules");
				await this.importRules(rulesFolder);
			})(),
			this.importRaces(racesFolder),
			(async () => {
				await this.importSpells(spellsFolder);
				// spells are required to be populated before classes can be imported
				await this.importClasses(classesFolder, world);
			})(),
		]).catch((err) => {
			console.warn(err);
		});
	};

	createSubFolder = async (topFolder: WikiFolder, name: string, world: World) => {
		const subFolder = new WikiFolder("", name, world._id, [], []);
		await this.wikiFolderRepository.create(subFolder);
		topFolder.children.push(subFolder._id);
		await this.wikiFolderRepository.update(topFolder);
		return subFolder;
	};

	createWikiContentFile = async (wikiId: string, content: string): Promise<File> => {
		const readStream = Readable.from(content);
		const filename = `wikiContent.${wikiId}`;
		const file = new File("", filename, readStream);
		await this.fileRepository.create(file);
		return file;
	};

	importMonsters = async (
		containingFolder: WikiFolder,
		creatureCodex: boolean,
		tomeOfBeasts: boolean
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
				const coverImage = await imageMutations.createImage(null, {
					file: {
						filename: monster.img_main,
						createReadStream: () => imageResponse.body,
					},
					worldId: containingFolder.world,
					chunkify: false,
				});
				monsterPage.coverImage = coverImage._id;
			}
			await this.monsterRepository.create(monsterPage);
			const content = this.deltaFactory.fromMonster(monster);
			const contentFile = await this.createWikiContentFile(
				monsterPage._id,
				JSON.stringify(content)
			);
			monsterPage.contentId = contentFile._id;
			await this.monsterRepository.update(monsterPage);
			containingFolder.pages.push(monsterPage._id);
			await this.wikiFolderRepository.update(containingFolder);
		}
	};

	importAdventurePages = async (topFolder: WikiFolder) => {
		const folders: WikiFolder[] = [];
		for await (let article of this.open5eApiClient.getAdventuringSections()) {
			const page = new Article("", article.name, topFolder.world, "", "");
			await this.articleRepository.create(page);
			const content = this.deltaFactory.fromSection(article);
			const contentFile = await this.createWikiContentFile(page._id, JSON.stringify(content));
			page.contentId = contentFile._id;
			await this.articleRepository.update(page);
			const containingFolder = folders.find((folder) => folder.name === article.parent);
			if (!containingFolder) {
				const containingFolder = new WikiFolder("", article.parent, topFolder.world, [], []);
				await this.wikiFolderRepository.create(containingFolder);
				topFolder.children.push(containingFolder._id);
				await this.wikiFolderRepository.update(topFolder);
				folders.push(containingFolder);
			}
			containingFolder.pages.push(page._id);
			await this.wikiFolderRepository.update(containingFolder);
		}
	};

	importRaces = async (containingFolder: WikiFolder) => {
		for await (let article of this.open5eApiClient.getRaces()) {
			const page = new Article("", article.name, containingFolder.world, "", "");
			await this.articleRepository.create(page);
			const content = this.deltaFactory.fromRace(article);
			const contentFile = await this.createWikiContentFile(page._id, JSON.stringify(content));
			page.contentId = contentFile._id;
			await this.articleRepository.update(page);
			containingFolder.pages.push(page._id);
			await this.wikiFolderRepository.update(containingFolder);
		}
	};

	importClasses = async (containingFolder: WikiFolder, world: World) => {
		for await (let article of this.open5eApiClient.getClasses()) {
			const page = new Article("", article.name, containingFolder.world, "", "");
			await this.articleRepository.create(page);
			const content = this.deltaFactory.fromCharacterClass(article, containingFolder.world);
			const contentFile = await this.createWikiContentFile(page._id, JSON.stringify(content));
			page.contentId = contentFile._id;
			await this.articleRepository.update(page);
			containingFolder.pages.push(page._id);
			await this.wikiFolderRepository.update(containingFolder);
		}
	};

	importSpells = async (containingFolder: WikiFolder) => {
		for await (let article of this.open5eApiClient.getSpells()) {
			const page = new Article("", article.name, containingFolder.world, "", "");
			await this.articleRepository.create(page);
			const content = this.deltaFactory.fromSpell(article);
			const contentFile = await this.createWikiContentFile(page._id, JSON.stringify(content));
			page.contentId = contentFile._id;
			await this.articleRepository.update(page);
			containingFolder.pages.push(page._id);
			await this.wikiFolderRepository.update(containingFolder);
		}
	};

	importRules = async (containingFolder: WikiFolder) => {
		for await (let rule of this.open5eApiClient.getRules()) {
			const page = new Article("", rule.name, containingFolder.world, "", "");
			await this.articleRepository.create(page);
			const subSections: Open5eRuleSection[] = [];
			for (let section of rule.subsections) {
				subSections.push(await this.open5eApiClient.getRuleSubSection(section.index));
			}
			const content = this.deltaFactory.fromRule(rule, subSections);
			const contentFile = await this.createWikiContentFile(page._id, JSON.stringify(content));
			page.contentId = contentFile._id;
			await this.articleRepository.update(page);
			containingFolder.pages.push(page._id);
			await this.wikiFolderRepository.update(containingFolder);
		}
	};
}
