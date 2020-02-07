import {WikiFolder} from "../../models/wiki-folder";
import {Place} from '../../models/place';
import {Image} from "../../models/image";
import {Person} from "../../models/person";
import {PermissionAssignment} from "../../models/permission-assignement";
import {WIKI_RW} from "../../../permission-constants";
import {WikiPage} from "../../models/wiki-page";

export const wikiResolvers = {
	createWiki: async (parent, {name, folderId}, {currentUser}) => {
		const folder = await WikiFolder.findById(folderId);
		if(!folder){
			throw new Error('Folder does not exist');
		}

		if(!await folder.userCanWrite(currentUser)){
			throw new Error(`You do not have permission to write to the folder ${folderId}`)
		}

		const newPage = await WikiPage.create({name, world: folder.world});
		folder.pages.push(newPage);
		await folder.save();

		if(!await newPage.userCanWrite(currentUser)){
			const readPermission = await PermissionAssignment.create({permission: WIKI_RW, subjectId: newPage._id});
			currentUser.permissions.push(readPermission);
			await currentUser.save();
		}

		return newPage;
	},
	deleteWiki: async (parent, {wikiId}, {currentUser}) => {
		const wikiPage = await WikiPage.findById(wikiId);
		if(!wikiPage){
			throw new Error('Page does not exist');
		}

		if(!await wikiPage.userCanWrite(currentUser)){
			throw new Error('You do not have permission to write to this page');
		}

		const parentFolder = await WikiFolder.findOne({pages: wikiPage._id});
		if(parentFolder){
			parentFolder.pages = parentFolder.pages.filter(page => !page._id.equals(wikiPage._id));
			await parentFolder.save();
		}

		await wikiPage.remove();
		return wikiPage;
	},
};