import mongoose from "mongoose";
import {ALL_WIKI_TYPES, ARTICLE, PLACE} from "../../common/src/type-constants";
import {Chunk} from "./models/chunk";
import {Image} from './models/image';

export const SUPPORTED_TYPES = [ARTICLE, PLACE];

const normalizeImage = async (properties, importedFiles, world) => {
	delete properties._id;
	const chunks = [...properties.chunks];
	properties.chunks = [];
	properties.world = world;
	if(properties.icon){
		properties.icon = await normalizeImage(properties.icon, importedFiles, world)
	}
	const image = await Image.create(properties);
	for(let chunk of chunks){
		delete chunk._id;
		chunk.fileId = importedFiles[chunk.fileId];
		if(!chunk.fileId){
			throw new Error(`chunk file ${chunk.fileId} not found!`);
		}
		chunk.world = world;
		chunk.image = image;
		image.chunks.push(await Chunk.create(chunk));
	}
	await image.save();
	return image;
};

const normalizeWikiPage = async (properties, importedFiles, world) => {

	delete properties._id;
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

const normalizePlace = async (properties, importedFiles, world) => {
	if(properties.mapImage){
		properties.mapImage = await normalizeImage(properties.mapImage, importedFiles, world);
	}
};

export const importFiles = async (importedFiles, world) => {

	const wikiFolder = world.rootFolder;

	for(let fileName of Object.keys(importedFiles)){
		const file = importedFiles[fileName];
		const modelName = fileName.split('.')[0];
		if(ALL_WIKI_TYPES.includes(modelName)){
			const model = mongoose.model(modelName);
			const properties = JSON.parse(file);
			await normalizeWikiPage(properties, importedFiles, world);
			switch(modelName){
				case PLACE:
					await normalizePlace(properties, importedFiles, world);
					break;
			}
			importedFiles[fileName] = await model.create(properties);
			wikiFolder.pages.push(importedFiles[fileName]);
			await wikiFolder.save();
		}
	}
}