import {FOLDER_RW} from "../../../../common/src/permission-constants";
import {WikiFolder} from "../../models/wiki-folder";

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

export const folderMutations = {
	createFolder: async (_, {name, parentFolderId}, {currentUser}) => {

		const parentFolder = await WikiFolder.findById(parentFolderId);
		if(!parentFolder){
			throw new Error('Parent folder does not exist');
		}

		if(!await parentFolder.userCanWrite(currentUser)){
			throw new Error(`You do not have the permission: ${FOLDER_RW} for the folder ${parentFolderId}`);
		}

		const newFolder = await WikiFolder.create({name, world: parentFolder.world});
		parentFolder.children.push(newFolder._id);
		await parentFolder.save();
		return newFolder.world;
	},
	renameFolder: async (_, {folderId, name}, {currentUser}) => {
		const folder = await WikiFolder.findById(folderId);
		if(!folder){
			throw new Error('Folder does not exist');
		}
		if(!await folder.userCanWrite(currentUser)){
			throw new Error(`You do not have the permission: ${FOLDER_RW} for the folder ${folderId}`);
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

		if(folder.world.rootFolder._id.equals(folder._id)){
			throw new Error('You cannot delete the root folder of a world');
		}

		await folder.remove();
		return folder.world;

	}
};