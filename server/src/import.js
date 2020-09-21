import mongoose from "mongoose";
import {ALL_WIKI_TYPES, ARTICLE} from "../../common/src/type-constants";
import {Chunk} from "./models/chunk";

export const SUPPORTED_TYPES = [ARTICLE];

const normalizeImage = async (properties, importedFiles, world) => {
	const chunks = [...properties.chunks];
	properties.chunks = [];
	properties.world = world;
	if(properties.icon){
		properties.icon = await normalizeImage(properties.icon, importedFiles, world)
	}
	const image = await Image.create(properties);
	for(let chunk of chunks){
		chunk.fileId = Object.keys(importedFiles)[chunk.fileId];
		if(!chunk.fileId){
			throw new Error(`chunk file ${chunk.fileId} not found!`);
		}
		chunk.world = world;
		chunk.image = image;
		properties.chunks.push(await Chunk.create(chunk));
	}
	await image.save();
	return image;
};

const normalizeWikiPage = async (properties, importedFiles, world) => {

	properties.world = world;

	if(properties.contentId){
		if(!Object.keys(importedFiles).includes(properties.contentId)){
			throw new Error(`Wiki page ${properties.name} references content ${properties.contentId} but is not provided`);
		}
		properties.contentId = importedFiles[properties.contentId];
	}

	if(properties.coverImage){
		properties.coverImage = await normalizeImage(properties.coverImage, importedFiles, world);
	}
};

export const importFiles = async (importedFiles, world) => {

	for(let fileName of Object.keys(importedFiles)){
		const file = importedFiles[fileName];
		const modelName = fileName.split('.')[0];

		if(SUPPORTED_TYPES.includes(modelName)) {
			const model = mongoose.model(modelName);
			const properties = JSON.parse(file);
			if(ALL_WIKI_TYPES.includes(modelName)){
				await normalizeWikiPage(properties, importedFiles, world);
				switch (modelName){
					case ARTICLE:
						const article = await model.create(properties);
						break;
				}
			}
		}

	}
}