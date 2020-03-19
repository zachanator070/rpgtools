import mongoose from 'mongoose';
import {WikiPage} from './wiki-page';
import {FOLDER_READ, FOLDER_READ_ALL, FOLDER_RW, FOLDER_RW_ALL} from "../../../common/src/permission-constants";
import {WIKI_FOLDER, WIKI_PAGE, WORLD} from "../../../common/src/type-constants";

const Schema = mongoose.Schema;

const wikiFolderSchema = new Schema({
	name: {
		type: String,
		required: [true, 'name field required']
	},
	world: {
		type: mongoose.Schema.ObjectId,
		required: [true, 'world field required'],
		ref: WORLD
	},
	pages: [{
		type: mongoose.Schema.ObjectId,
		ref: WIKI_PAGE,
	}],
	children: [{
		type: mongoose.Schema.ObjectId,
		ref: WIKI_FOLDER
	}]
});

wikiFolderSchema.methods.userCanWrite = async function(user){
	return await user.hasPermission(FOLDER_RW, this._id) ||
		await user.hasPermission(FOLDER_RW_ALL, this.world);
};

wikiFolderSchema.methods.userCanRead = async function(user){
	return await user.hasPermission(FOLDER_READ, this._id) ||
		await user.hasPermission(FOLDER_READ_ALL, this.world) || await this.userCanWrite(user);
};

wikiFolderSchema.post('remove', async function(folder) {
	await WikiPage.remove({_id: {$in: folder.pages}});
	await WikiFolder.remove({_id: {$in: folder.children}});

	const parentFolder = await WikiFolder.findOne({children: folder._id});
	if(parentFolder){
		parentFolder.children = parentFolder.children.filter(childId => !childId.equals(folder._id));
		await parentFolder.save();
	}
});

export const WikiFolder = mongoose.model(WIKI_FOLDER, wikiFolderSchema);

