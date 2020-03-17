import {WikiFolder} from "../../models/wiki-folder";
import {PermissionAssignment} from "../../models/permission-assignement";
import {WIKI_RW} from "../../../permission-constants";
import {WikiPage} from "../../models/wiki-page";
import {GridFSBucket} from "mongodb";
import mongoose from "mongoose";
import {cleanUpPermissions} from "../../db-helpers";
import {ARTICLE} from "../../../type-constants";
import {authenticated} from "../../authentication-helpers";

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

		return newPage.world;
	}),
	updateWiki: async (parent, {wikiId, name, content, coverImageId, type}, {currentUser}) => {
		const wikiPage = await WikiPage.findById(wikiId).populate('world content');
		if(!wikiPage){
			throw new Error(`Wiki ${wikiId} does not exist`);
		}
		if(!await wikiPage.userCanWrite(currentUser)){
			throw new Error('You do not have permission to write to this page');
		}

		if(content !== null){
			content = await content;
			const stream = await content.createReadStream();

			const gfs = new GridFSBucket(mongoose.connection.db);

			let wikiPageContent = await gfs.find({_id: wikiPage.contentId}).next();
			if(content){

				let writeStream = null;
				if(wikiPageContent){
					writeStream = gfs.openUploadStream(wikiPageContent.filename);
				}
				else{
					writeStream = gfs.openUploadStream(`wikiContent.${wikiPage._id}`);
				}
				await new Promise((resolve, reject) => {

					stream.pipe(writeStream);

					stream.on('end', () => {
						wikiPage.contentId = writeStream.id;
						resolve();
					});
					stream.on('error', (err) => {
						reject(err);
					});
				});
			}
			else{
				if(wikiPageContent){
					await gfs.delete(wikiPageContent._id);
					wikiPage.contentId = null;
				}
			}
		}

		if(name !== null){
			wikiPage.name = name;
		}

		wikiPage.coverImage = coverImageId;

		if(type !== null){
			wikiPage.type = type;
			wikiPage.__t = type;
		}

		await wikiPage.save();
		await wikiPage.populate('coverImage').execPopulate();
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
		await wikiPage.remove();
		return wikiPage.world;
	},
};