import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2'
import {
	FOLDER_READ_ALL_PAGES,
	FOLDER_RW_ALL_PAGES,
	WIKI_ADMIN,
	WIKI_ADMIN_ALL,
	WIKI_READ,
	WIKI_READ_ALL,
	WIKI_RW,
	WIKI_RW_ALL
} from "@rpgtools/common/src/permission-constants";
import {GridFSBucket} from "mongodb";
import {IMAGE, PLACE, WIKI_PAGE, WORLD} from "@rpgtools/common/src/type-constants";
import {deleteImage} from "../resolvers/mutations/image-mutations";
import {deleteGfsFile} from "../db-helpers";
import {World} from "./world";
import {WikiFolder} from "./wiki-folder";

const Schema = mongoose.Schema;

const wikiPageSchema = new Schema({
	name: {
		type: String,
		required: [true, 'name field required']
	},
	world: {
		type: mongoose.Schema.ObjectId,
		required: [true, 'world field required'],
		ref: WORLD
	},
	coverImage: {
		type: mongoose.Schema.ObjectId,
		ref: IMAGE,
	},
	contentId: {
		type: mongoose.Schema.ObjectId,
	},
	content: {
		type: String,
		get: async function () {
			const gfs = new GridFSBucket(mongoose.connection.db);
			const file = await gfs.find({_id: this.contentId}).next();
			if(file){
				const stream = gfs.openDownloadStream(file._id);
				const chunks = [];
				await new Promise((resolve, reject) => {
					stream.on('data', (data) => {
						chunks.push(data);
					});
					stream.on('err', (err) => {
						reject(err);
					});
					stream.on('end', () => {
						resolve();
					});
				});
				return Buffer.concat(chunks).toString('utf8');
			}
			return null;
		}
	}
},
{
	discriminatorKey: 'type'
});


wikiPageSchema.methods.userCanAdmin = async function(user) {
	return await user.hasPermission(WIKI_ADMIN, this._id) || await user.hasPermission(WIKI_ADMIN_ALL, this.world);
};

wikiPageSchema.methods.userCanWrite = async function(user){
	const parentFolder = await WikiFolder.findOne({pages: this._id});
	let parentWriteAll = false;
	if(parentFolder){
		parentWriteAll = await user.hasPermission(FOLDER_RW_ALL_PAGES, parentFolder._id);
	}
	return parentWriteAll ||
		await user.hasPermission(WIKI_RW, this._id) ||
		await user.hasPermission(WIKI_RW_ALL, this.world);
};

wikiPageSchema.methods.userCanRead = async function(user){
	if(this.type === PLACE && await World.findOne({wikiPage: this._id})){
		return true;
	}
	const parentFolder = await WikiFolder.findOne({pages: this._id});
	let parentReadAll = false;
	if(parentFolder){
		parentReadAll = await user.hasPermission(FOLDER_READ_ALL_PAGES, parentFolder._id);
	}
	return parentReadAll ||
		await user.hasPermission(WIKI_READ, this._id) ||
		await user.hasPermission(WIKI_READ_ALL, this.world) ||
		await this.userCanWrite(user);
};

wikiPageSchema.pre('deleteOne', { document: true, query: false }, async function(){
	if(this.coverImage){
		await deleteImage(this.coverImage);
	}
	if(this.contentId){
		await deleteGfsFile(this.contentId);
	}
	// doing this to avoid circular dependency
	const pinModel = mongoose.model('Pin');
	const pins = await pinModel.find({page: this._id});
	for(let pin of pins){
		pin.page = null;
		await pin.save();
	}
});

wikiPageSchema.plugin(mongoosePaginate);

export const WikiPage = mongoose.model(WIKI_PAGE, wikiPageSchema);
