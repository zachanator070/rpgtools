import {
  getAdventuringSections,
  getClasses,
  getMonsters,
  getRaces,
  getSpells,
} from "./open-5e-api-client";
import { monsterToDelta } from "./monster-to-delta";
import { Article } from "../models/article";
import { ARTICLE } from "@rpgtools/common/src/type-constants";
import fetch from "node-fetch";
import { imageMutations } from "../resolvers/mutations/image-mutations";
import { WikiFolder } from "../models/wiki-folder";
import { sectionToDelta } from "./section-to-delta";
import { Readable } from "stream";
import { createGfsFile } from "../db-helpers";
import { raceToDelta } from "./race-to-delta";
import { classToDelta } from "./class-to-delta";
import { spellToDelta } from "./spell-to-delta";

export class FiveEImporter {
  constructor(world) {
    this.world = world;
  }

  createSubFolder = async (topFolder, name) => {
    const subFolder = await WikiFolder.create({ name, world: this.world });
    topFolder.children.push(subFolder);
    await topFolder.save();
    return subFolder;
  };

  createArticles = async (
    articles,
    getContent,
    getContainingFolder,
    filter = () => {},
    callback = () => {}
  ) => {
    for await (let article of articles) {
      const content = await getContent(article);
      const page = await Article.create({
        name: article.name,
        type: ARTICLE,
        world: this.world,
      });
      page.contentId = await this.createWikiContentFile(
        page._id,
        JSON.stringify(content)
      );
      await page.save();
      const containingFolder = await getContainingFolder(article);
      containingFolder.pages.push(page);
      await containingFolder.save();
      await callback(article, page);
    }
  };

  createWikiContentFile = async (wikiId, content) => {
    const readStream = Readable.from(content);
    const filename = `wikiContent.${wikiId}`;
    return createGfsFile(filename, readStream);
  };

  importMonsters = async (containingFolder, creatureCodex, tomeOfBeasts) => {
    await this.createArticles(
      getMonsters(),
      monsterToDelta,
      () => containingFolder,
      (monster) =>
        (monster.document__slug === "cc" && creatureCodex) ||
        (monster.document__slug === "tob" && tomeOfBeasts) ||
        monster.document__slug === "wotc",
      async (monster, page) => {
        if (monster.img_main) {
          const imageResponse = await fetch(monster.img_main);
          page.coverImage = await imageMutations.createImage(null, {
            file: {
              filename: monster.img_main,
              createReadStream: () => imageResponse.body,
            },
            worldId: this.world._id,
            chunkify: false,
          });
          await page.save();
        }
      }
    );
  };

  importAdventurePages = async (topFolder) => {
    const folders = {};

    await this.createArticles(
      getAdventuringSections(),
      (article) => sectionToDelta(article.name, article.desc),
      async (article) => {
        if (!folders[article.parent]) {
          folders[article.parent] = await WikiFolder.create({
            name: article.parent,
            world: this.world,
          });
          topFolder.children.push(folders[article.parent]);
          await topFolder.save();
        }
        return folders[article.parent];
      }
    );
  };

  importRaces = async (containingFolder) => {
    await this.createArticles(getRaces(), raceToDelta, () => containingFolder);
  };

  importClasses = async (containingFolder, world) => {
    await this.createArticles(
      getClasses(),
      async (className) => classToDelta(className, world),
      () => containingFolder
    );
  };

  importSpells = async (containingFolder) => {
    await this.createArticles(
      getSpells(),
      spellToDelta,
      () => containingFolder
    );
  };
}
