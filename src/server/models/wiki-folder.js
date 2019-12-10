import mongoose from 'mongoose';
import {WikiPage} from './wiki-page';
import mongooseAutopopulate from "mongoose-autopopulate";
import {FOLDER_READ, FOLDER_READ_ALL, FOLDER_RW, FOLDER_RW_ALL} from "../../permission-constants";
import {userHasPermission} from "../authorization-helpers";
const Schema = mongoose.Schema;

const wikiFolderSchema = new Schema({
	name: {
		type: String,
		required: [true, 'name field required']
	},
	world: {
		type: mongoose.Schema.ObjectId,
		required: [true, 'world field required'],
		ref: 'World'
	},
	pages: [{
		type: mongoose.Schema.ObjectId,
		ref: 'WikiPage',
		autopopulate: true
	}],
	children: [{
		type: mongoose.Schema.ObjectId,
		ref: 'WikiFolder'
	}]
});

wikiFolderSchema.methods.userCanWrite = async function(user){
	return await userHasPermission(user, FOLDER_RW, this._id) ||
		await userHasPermission(user, FOLDER_RW_ALL, this.world);
};

wikiFolderSchema.methods.userCanRead = async function(user){
	return await userHasPermission(user, FOLDER_READ, this._id) ||
		await userHasPermission(user, FOLDER_READ_ALL, this.world) || await this.userCanWrite(user);
};

wikiFolderSchema.plugin(mongooseAutopopulate);

wikiFolderSchema.post('remove', async function(folder) {
	await WikiPage.remove({_id: {$in: folder.pages}});
	await WikiFolder.remove({_id: {$in: folder.children}});

	const parentFolder = await WikiFolder.findOne({children: folder._id});
	if(parentFolder){
		parentFolder.children = parentFolder.children.filter(childId => !childId.equals(folder._id));
		await parentFolder.save();
	}
});

export const WikiFolder = mongoose.model('WikiFolder', wikiFolderSchema);

