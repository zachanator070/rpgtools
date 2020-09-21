import express from "express";
import {createSessionContext} from "../authentication-helpers";
import {ALL_WIKI_TYPES, ARTICLE} from "../../../common/src/type-constants";
import {Article} from "../models/article";
import mongodb, {GridFSBucket} from "mongodb";
import mongoose from "mongoose";
import archiver from 'archiver';
import {Readable} from 'stream';
import {WikiPage} from "../models/wiki-page";

let ExportRouter = express.Router();

const getFileFromFileId = async (fileId) => {
	return new Promise((resolve, reject) => {
		const gfs = new GridFSBucket(mongoose.connection.db);
		const id = new mongodb.ObjectID(fileId);
		gfs.find({_id: id}).next( (err, file) => {
			if(err){
				reject(err);
				return;
			}
			if(file === null ){
				reject(`file not found with id ${fileId}`);
				return;
			}
			resolve(file);
		});
	});
};

const getReadStreamFromFile = (file) => {
	const gfs = new GridFSBucket(mongoose.connection.db);
	return gfs.openDownloadStream(file._id);
}

const prepImage = async (image, archive) => {
	for(let chunk of image.chunks){
		const chunkFile = (await getFileFromFileId(chunk.fileId));
		archive.append(getReadStreamFromFile(chunkFile), {name: chunkFile.filename})
		chunk.fileId = chunkFile.filename;
	}
};

const prepWikiPage = async (page, archive) => {
	const pageObject = page.toJSON();
	if(pageObject.coverImage){
		await prepImage(pageObject.coverImage, archive);
		if(pageObject.coverImage.icon){
			await prepImage(pageObject.coverImage.icon, archive);
		}
	}
	if(pageObject.contentId){
		const contentFile = await getFileFromFileId(pageObject.contentId);
		archive.append(getReadStreamFromFile(contentFile), {name: contentFile.filename});
		pageObject.contentId = contentFile.filename;
	}
	switch (page.constructor.modelName){
		case ARTICLE:
			break;
		default:
			throw new Error(`Model ${page.constructor.modelName} not supported`);
	}
	archive.append(Readable.from([JSON.stringify(pageObject)]), {name: `${page.constructor.modelName}.${pageObject._id}.json`});
}

ExportRouter.get('/:model/:id', async (req, res) => {
	const context = await createSessionContext({req, res, connection: null});
	const currentUser = context.currentUser;
	const modelName = req.params.model;
	const docId = req.params.id;

	const archive = archiver('zip', {
		zlib: { level: 9 } // Sets the compression level.
	});

	try{
		archive.on('warning', function(err) {
			if (err.code === 'ENOENT') {
				console.warning(err.message);
			} else {
				// throw error
				throw err;
			}
		});

		archive.on('error', function(err) {
			throw err;
		});

		archive.pipe(res);

		if(ALL_WIKI_TYPES.includes(modelName)){
			const page = await WikiPage.findById(docId).populate({
				path: 'coverImage',
				populate: {
					path: 'chunks icon',
					populate: {
						path: 'chunks',
					}
				}
			});
			if(!page){
				return res.sendStatus(404);
			}
			if(!await page.userCanRead(currentUser)){
				return res.sendStatus(403);
			}
			await prepWikiPage(page, archive);

		}

		return archive.finalize();
	}
	catch (e) {
		return res.status(400).send(e.message);
	}

});

export default ExportRouter;