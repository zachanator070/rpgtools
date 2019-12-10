import mongoose from 'mongoose';
import mongooseAutopopulate from "mongoose-autopopulate";
import {WIKI_READ, WIKI_READ_ALL, WIKI_RW, WIKI_RW_ALL} from "../../permission-constants";
import {userHasPermission} from "../authorization-helpers";

const Schema = mongoose.Schema;

const wikiPageSchema = new Schema({
	name: {
		type: String,
		required: [true, 'name field required']
	},
	world: {
		type: mongoose.Schema.ObjectId,
		required: [true, 'world field required'],
		ref: 'World'
	},
	coverImage: {
		type: mongoose.Schema.ObjectId,
		ref: 'Image',
		autopopulate: true
	},
	content: String,
	type: {type: String, default: "WikiPage"},
});

wikiPageSchema.methods.userCanWrite = async function(user){
	return await userHasPermission(user, WIKI_RW, this._id) ||
		await userHasPermission(user, WIKI_RW_ALL, this.world);
};

wikiPageSchema.methods.userCanRead = async function(user){
	return await userHasPermission(user, WIKI_READ, this._id) ||
	await userHasPermission(user, WIKI_READ_ALL, this.world) || await this.userCanWrite(user);
};

// @TODO add post remove hook to delete cover image

wikiPageSchema.plugin(mongooseAutopopulate);

export const WikiPage = mongoose.model('WikiPage', wikiPageSchema);
