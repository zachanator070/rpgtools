import {getAdventuringSections, getMonsters} from "./open-5e-api-client";
import {monsterToDelta} from "./5e-monster-to-quill-delta";
import {Article} from "../models/article";
import {ARTICLE} from "../../../common/src/type-constants";
import fetch from "node-fetch";
import {imageMutations} from "../resolvers/mutations/image-mutations";
import {WikiFolder} from "../models/wiki-folder";
import {sectionToDelta} from "./5e-section-to-quill-delta";
import {Readable} from "stream";
import {createGfsFile} from "../db-helpers";

export class FiveEImporter{

	constructor(world) {
		this.world = world;
	}

	createWikiContentFile = async (wikiId, content) => {

		const readStream = Readable.from(content);
		const filename = `wikiContent.${wikiId}`;
		return createGfsFile(filename, readStream);

	};
	
	importMonsters = async (topFolder, creatureCodex, tomeOfBeasts) => {
		const monsterFolder = await WikiFolder.create({name: 'Monsters', world: this.world});
		topFolder.children.push(monsterFolder);
		await topFolder.save();
		const monsters = getMonsters();
		for await (let monster of monsters){
			if(monster.document__slug === 'cc' && !creatureCodex){
				continue;
			}
			if(monster.document__slug === 'tob' && !tomeOfBeasts){
				continue;
			}
			const content = monsterToDelta(monster);
			const page = await Article.create({name: monster.name, type: ARTICLE, world: this.world});
			page.contentId = await this.createWikiContentFile(page._id, JSON.stringify(content));
			if(monster.img_main){
				const imageResponse = await fetch(monster.img_main);
				page.coverImage = await imageMutations.createImage(null, {file: {filename: monster.img_main, createReadStream: () => imageResponse.body}, worldId: this.world._id, chunkify: false});
			}
			await page.save();
			monsterFolder.pages.push(page);
		}
		await monsterFolder.save();
		await topFolder.save();
	}
	
	importAdventurePages = async (topFolder) => {
		const adventuringFolder = await WikiFolder.create({name: 'Adventuring', world: this.world});
		topFolder.children.push(adventuringFolder);
		const sections = getAdventuringSections();

		for await (let section of sections){
			const content = sectionToDelta(section.name, section.desc);
			const page = await Article.create({name: section.name, type: ARTICLE, world: this.world});
			page.contentId = await this.createWikiContentFile(page._id, JSON.stringify(content));
			await page.save();
			adventuringFolder.pages.push(page);
		}
		await adventuringFolder.save();
		await topFolder.save();
	}
}