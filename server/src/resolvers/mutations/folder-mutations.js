import {FOLDER_ADMIN, FOLDER_RW} from "../../../../common/src/permission-constants";
import {WikiFolder} from "../../models/wiki-folder";
import {PermissionAssignment} from "../../models/permission-assignement";
import {WIKI_FOLDER} from "../../../../common/src/type-constants";
import {cleanUpPermissions} from "../../db-helpers";
import {WikiPage} from "../../models/wiki-page";

/**
 * Throws an error if the user does not have write access to any of the children folders or pages.
 * Requires pre-validation that the folderId exists.
 * @param {mongoose.Document} user
 * @param {string} folderId
 * @returns {Promise<void>}
 * @throws {Error} - Thrown when you do not have permission to a child of the given folder
 */
const checkUserWritePermissionForFolderContents = async (user, folderId) => {

	const folder = await WikiFolder.findById(folderId);
	await folder.populate('pages childFolder').execPopulate();

	if(!await folder.userCanWrite(user)){
		throw new Error(`You do not have write permission for the folder ${folderId}`);
	}

	// pages are auto populated
	for(let childPage of folder.pages){
		if(!await childPage.userCanWrite(user)){
			throw new Error(`You do not have write permission for the page ${childPage._id}`);
		}
	}

	// children folders are not auto populated
	for(let childFolder of folder.children){
		await checkUserWritePermissionForFolderContents(user, childFolder);
	}

};

const recurseDeleteFolder = async (folder) => {

	await folder.populate('pages children').execPopulate();

	for(let child of folder.children){
		await recurseDeleteFolder(child);
	}

	for(let page of folder.pages){
		await cleanUpPermissions(page._id);
		await WikiPage.deleteOne({_id: page._id});
	}

	await cleanUpPermissions(folder._id);
	await WikiFolder.deleteOne({_id: folder._id});
}

export const folderMutations = {
	createFolder: async (_, {name, parentFolderId}, {currentUser}) => {

		const parentFolder = await WikiFolder.findById(parentFolderId);
		if(!parentFolder){
			throw new Error('Parent folder does not exist');
		}

		if(!await parentFolder.userCanWrite(currentUser)){
			throw new Error(`You do not have permission for this folder`);
		}
		const newFolder = await WikiFolder.create({name, world: parentFolder.world});
		parentFolder.children.push(newFolder._id);
		await parentFolder.save();

		for(let permission of [FOLDER_RW, FOLDER_ADMIN]){
			const newPermission = await PermissionAssignment.create({permission, subject: newFolder._id, subjectType: WIKI_FOLDER});
			currentUser.permissions.push(newPermission);
		}
		await currentUser.save();

		return newFolder.world;
	},
	renameFolder: async (_, {folderId, name}, {currentUser}) => {
		const folder = await WikiFolder.findById(folderId);
		if(!folder){
			throw new Error('Folder does not exist');
		}
		if(!await folder.userCanWrite(currentUser)){
			throw new Error(`You do not have permission for this folder`);
		}

		folder.name = name;
		await folder.save();
		return folder;
	},
	deleteFolder: async (_, {folderId}, {currentUser}) => {
		const folder = await WikiFolder.findById(folderId).populate('pages children world');
		if(!folder){
			throw new Error('Folder does not exist');
		}

		await checkUserWritePermissionForFolderContents(currentUser, folderId);

		if(folder.world.rootFolder.equals(folder._id)){
			throw new Error('You cannot delete the root folder of a world');
		}

		const parents = await WikiFolder.find({children: folder._id});
		for(let parent of parents){
			parent.children = parent.children.filter(child => ! child.equals(folder._id));
			await parent.save();
		}

		await recurseDeleteFolder(folder);

		return folder.world;

	},
	moveFolder: async (_, {folderId, parentFolderId}, {currentUser}) => {
		const folder = await WikiFolder.findById(folderId).populate('world');
		if(!folder){
			throw new Error(`Folder with id ${folderId} does not exist`);
		}
		const parentFolder = await WikiFolder.findById(parentFolderId);
		if(!parentFolder){
			throw new Error(`Folder with id ${parentFolderId} does not exist`);
		}
		if(folderId === parentFolderId){
			throw new Error('Folder cannot be a parent of itself');
		}

		const currentParent = await WikiFolder.findOne({children: folder._id});

		for(let folderToCheck of [folder, parentFolder, currentParent]){
			if(!await folderToCheck.userCanWrite(currentUser)){
				throw new Error(`You do not have permission to edit folder ${folder.name}`);
			}
		}

		currentParent.children = currentParent.children.filter((childId) => !childId.equals(folder._id));
		await currentParent.save();
		parentFolder.children.push(folder);
		await parentFolder.save();
		return folder.world;

	}
};