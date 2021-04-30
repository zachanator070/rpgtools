import mongoose from "mongoose";
import {
	ALL_WIKI_TYPES,
	ARTICLE,
	ITEM,
	MODEL,
	MODELED_WIKI_TYPES,
	MONSTER,
	PERSON,
	PLACE,
} from "../../../common/src/type-constants";
import { Chunk } from "../models/chunk";
import { Image } from "../models/image";
import unzipper from "unzipper";
import { createGfsFile } from "../db-helpers";
import { Model } from "../models/model";
import { WikiFolder } from "../models/wiki-folder";
import { Mutex } from "async-mutex";

export const SUPPORTED_TYPES = [ARTICLE, PLACE, MONSTER, PERSON, ITEM, MODEL];

class DeferredPromise {
	constructor() {
		this.promise = new Promise((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
		});
	}
}

export class ContentImporter {
	constructor() {
		this.processedDocs = {};
		this.folder = null;
		this.folderSavingMutexes = {};
	}

	async importImage(properties) {
		delete properties._id;
		const chunks = [...properties.chunks];
		properties.chunks = [];
		properties.world = this.folder.world;
		if (properties.icon) {
			properties.icon = await this.importImage(properties.icon);
		}
		const image = await Image.create(properties);
		for (let chunk of chunks) {
			chunk.fileId = await this.processedDocs[chunk.fileId].promise;
			if (!chunk.fileId) {
				throw new Error(
					`Chunk ${chunk._id} references file ${chunk.fileId} but is not provided in archive`
				);
			}
			delete chunk._id;
			chunk.world = this.folder.world;
			chunk.image = image;
			image.chunks.push(await Chunk.create(chunk));
		}
		await image.save();
		return image;
	}

	async saveWikiFolder(wikiFolder) {
		let mutex = this.folderSavingMutexes[wikiFolder._id.toString()];
		if (!mutex) {
			mutex = new Mutex();
			this.folderSavingMutexes[wikiFolder._id.toString()] = mutex;
		}
		const release = await mutex.acquire();
		try {
			await wikiFolder.save();
		} finally {
			release();
		}
	}

	async importWikiPage(path, properties) {
		const modelName = this.getModelFromPath(path);
		let wikiFolder = this.folder;
		const folderStructure = path
			.replace(this.getFilenameFromPath(path), "")
			.slice(0, -1)
			.split("/");
		folderStructure.shift();
		while (folderStructure.length > 0) {
			let foundChild = false;
			for (let child of wikiFolder.children) {
				if (child.name === folderStructure[0]) {
					foundChild = true;
					wikiFolder = child;
					folderStructure.shift();
					await wikiFolder.populate("children").execPopulate();
				}
			}
			if (!foundChild) {
				const newFolder = await WikiFolder.create({
					name: folderStructure[0],
					world: this.folder.world,
				});
				wikiFolder.children.push(newFolder);
				await this.saveWikiFolder(wikiFolder);
				wikiFolder = newFolder;
				folderStructure.shift();
			}
		}

		const model = mongoose.model(modelName);

		delete properties._id;
		properties.world = this.folder.world;

		if (properties.contentId) {
			if (!Object.keys(this.processedDocs).includes(properties.contentId)) {
				throw new Error(
					`Wiki page ${properties.name} references content ${properties.contentId} but is not provided in archive`
				);
			}
			properties.contentId = await this.processedDocs[properties.contentId].promise;
		}

		if (properties.coverImage) {
			properties.coverImage = await this.importImage(properties.coverImage);
		}

		if (modelName === PLACE) {
			if (properties.mapImage) {
				properties.mapImage = await this.importImage(properties.mapImage);
			}
		} else if (MODELED_WIKI_TYPES.includes(modelName)) {
			if (properties.model) {
				if (!this.processedDocs[properties.model]) {
					throw new Error(
						`Wiki page ${properties.name} references model ${properties.model} but was not provided in archive`
					);
				}
				properties.model = await this.processedDocs[properties.model].promise;
			}
		}
		const page = await model.create(properties);
		wikiFolder.pages.push(page);
		await this.saveWikiFolder(wikiFolder);
		return page;
	}

	async importModel(properties) {
		delete properties._id;
		if (!this.processedDocs[properties.fileId]) {
			throw new Error(
				`Model ${properties.name} references file ${properties.fileId} which was not provided in archive`
			);
		}
		properties.fileId = await this.processedDocs[properties.fileId].promise;
		properties.world = this.folder.world;
		return await Model.create(properties);
	}

	async processFile(path, file) {
		const modelName = this.getModelFromPath(path);

		let document = null;

		if (ALL_WIKI_TYPES.includes(modelName)) {
			document = await this.importWikiPage(path, JSON.parse(file));
		} else if (modelName === MODEL) {
			document = await this.importModel(JSON.parse(file));
		}

		this.processedDocs[path].resolve(document);
	}

	async importFiles(fileContents) {
		for (let fileName of Object.keys(fileContents)) {
			this.processedDocs[fileName] = new DeferredPromise();
		}

		const processes = [];

		for (let path of Object.keys(fileContents)) {
			const modelName = this.getModelFromPath(path);
			if (SUPPORTED_TYPES.includes(modelName)) {
				processes.push(this.processFile(path, fileContents[path]));
			} else {
				// we assume it is a data file that has already been read into a GFS file
				this.processedDocs[path].resolve(fileContents[path]);
			}
		}

		await Promise.all(processes);
	}

	getModelFromPath(path) {
		return this.getFilenameFromPath(path).split(".")[0];
	}

	getFilenameFromPath(path) {
		const pathComponents = path.split("/");
		return pathComponents[pathComponents.length - 1];
	}

	async importArchive(archiveReadStream, folder) {
		const fileContents = {};
		this.folder = folder;

		await new Promise((resolve, reject) => {
			const fileReadingPromises = [];
			archiveReadStream
				.pipe(unzipper.Parse())
				.on("entry", async (entry) => {
					const path = entry.path;
					const modelName = this.getModelFromPath(path);
					if (SUPPORTED_TYPES.includes(modelName)) {
						fileReadingPromises.push(
							new Promise((resolve, reject) => {
								const rawData = [];
								entry.on("data", (data) => {
									rawData.push(data);
								});
								entry.on("end", () => {
									resolve(rawData);
								});
								entry.on("error", (err) => {
									reject(err);
								});
							}).then((buffer) => {
								fileContents[path] = buffer.toString();
							})
						);
					} else {
						fileReadingPromises.push(
							createGfsFile(this.getFilenameFromPath(path), entry).then((fileId) => {
								fileContents[path] = fileId;
							})
						);
					}
				})
				.on("error", (error) => {
					console.warn(error);
					reject(error);
				})
				.on("finish", async () => {
					await Promise.all(fileReadingPromises);
					resolve();
				});
		});

		try {
			await this.importFiles(fileContents);
		} catch (e) {
			console.log(e.message);
			return false;
		}

		return true;
	}
}
