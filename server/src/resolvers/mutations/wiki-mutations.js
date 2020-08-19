import {WikiFolder} from "../../models/wiki-folder";
import {PermissionAssignment} from "../../models/permission-assignement";
import {WIKI_RW} from "../../../../common/src/permission-constants";
import {WikiPage} from "../../models/wiki-page";
import {GridFSBucket} from "mongodb";
import mongoose from "mongoose";
import {cleanUpPermissions} from "../../db-helpers";
import {ARTICLE, PERSON, PLACE} from "../../../../common/src/type-constants";
import {authenticated} from "../../authentication-helpers";
import {Place} from "../../models/place";
import {Image} from "../../models/image";
import {Person} from '../../models/person';
import {Article} from "../../models/article";

export const wikiMutations = {
	createWiki: authenticated(async (parent, {name, folderId}, {currentUser}) => {
		const folder = await WikiFolder.findById(folderId);
		if(!folder){
			throw new Error('Folder does not exist');
		}

		if(!await folder.userCanWrite(currentUser)){
			throw new Error(`You do not have permission to write to the folder ${folderId}`)
		}

		const newPage = await WikiPage.create({name, world: folder.world, type: ARTICLE});
		folder.pages.push(newPage);
		await folder.save();

		if(!await newPage.userCanWrite(currentUser)){
			const readPermission = await PermissionAssignment.create({permission: WIKI_RW, subjectId: newPage._id});
			currentUser.permissions.push(readPermission);
			await currentUser.save();
		}

		await newPage.populate('world').execPopulate();
		return newPage.world;
	}),
	updateWiki: async (parent, {wikiId, name, content, coverImageId, type}, {currentUser}) => {
		let wikiPage = await WikiPage.findById(wikiId).populate('world content');
		if(!wikiPage){
			throw new Error(`Wiki ${wikiId} does not exist`);
		}
		if(!await wikiPage.userCanWrite(currentUser)){
			throw new Error('You do not have permission to write to this page');
		}

		if(content){
			content = await content;
			const stream = await content.createReadStream();

			const gfs = new GridFSBucket(mongoose.connection.db);

			let wikiPageContent = await gfs.find({_id: wikiPage.contentId}).next();

			let writeStream = null;
			if(wikiPageContent){
				writeStream = gfs.openUploadStream(wikiPageContent.filename);
			}
			else{
				writeStream = gfs.openUploadStream(`wikiContent.${wikiPage._id}`);
			}
			await new Promise((resolve, reject) => {

				// NOTE: readable.pipe was having weird behavior where a fs.files document was not being created
				stream.on('data', (data) => {
					writeStream.write(data);
				});

				stream.on('end', () => {
					writeStream.end();
				});

				stream.on('error', (err) => {
					reject(err);
				});

				writeStream.on('finish', (file) => {
					wikiPage.contentId = file._id;
					resolve();
				});

			});
		}

		if(name){
			wikiPage.name = name;
		}

		if(coverImageId){
			const image = await Image.findById(coverImageId);
			if(!image){
				throw new Error(`No image exists with id ${coverImageId}`);
			}
		}
		wikiPage.coverImage = coverImageId;

		if(type){
			// NOTE: Hydrate causes error on save if object ref is used in hydration
			const wikiPageObject = wikiPage.toObject();
			switch (type) {
				case PERSON:
					wikiPage = Person.hydrate({_id: wikiPageObject._id});
					break;
				case PLACE:
					wikiPage = Place.hydrate({_id: wikiPageObject._id});
					break;
				case ARTICLE:
					wikiPage = Article.hydrate({_id: wikiPageObject._id});
					break;
			}
			wikiPage.world = wikiPageObject.world._id;
			wikiPage.name = wikiPageObject.name;
			wikiPage.contentId = wikiPageObject.contentId;
			wikiPage.coverImage = wikiPageObject.coverImage;
		}

		await wikiPage.save();
		await wikiPage.populate({path: 'coverImage', populate: {path: 'chunks icon', populate: {path: 'chunks'}}}).execPopulate();
		return wikiPage;
	},
	deleteWiki: async (parent, {wikiId}, {currentUser}) => {
		const wikiPage = await WikiPage.findById(wikiId).populate('world');
		if(!wikiPage){
			throw new Error('Page does not exist');
		}

		if(!await wikiPage.userCanWrite(currentUser)){
			throw new Error('You do not have permission to write to this page');
		}

		if(wikiPage.world.wikiPage.equals(wikiPage._id)){
			throw new Error('You cannot delete the main page of a world')
		}

		const parentFolder = await WikiFolder.findOne({pages: wikiPage._id});

		if(parentFolder){
			parentFolder.pages = parentFolder.pages.filter(page => !page._id.equals(wikiPage._id));
			await parentFolder.save();
		}

		await cleanUpPermissions(wikiPage._id);
		await WikiPage.deleteOne({_id: wikiId});
		return wikiPage.world;
	},
	updatePlace: async (parent, {placeId, mapImageId}, {currentUser}) => {
		const place = await Place.findById(placeId);
		if(!place){
			throw new Error(`Place ${placeId} does not exist`);
		}

		if(!await place.userCanWrite(currentUser)){
			throw new Error(`You do not have permission to write to this page`);
		}

		if(mapImageId){
			const image = await Image.findById(mapImageId);
			if(!image){
				throw new Error(`Image with id ${mapImageId} does not exist`);
			}
		}

		place.mapImage = mapImageId;
		await place.save();
		await place.populate({path: 'mapImage', populate: {path: 'chunks icon', populate: {path: 'chunks'}}}).execPopulate();
		return place;
	}
};