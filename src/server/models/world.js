import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-aggregate-paginate-v2'
import mongooseAutopopulate from "mongoose-autopopulate";
import {userHasPermission} from "../authorization-helpers";
import {WORLD_READ} from "../../permission-constants";
const Schema = mongoose.Schema;

const worldSchema = new Schema({
	name: {
		type: String,
		required: [true, 'name field required']
	},
	wikiPage: {
		type: mongoose.Schema.ObjectId,
		ref: 'WikiPage',
		autopopulate: true
	},
	rootFolder: {
		type: mongoose.Schema.ObjectId,
		ref: 'WikiFolder',
		autopopulate: true
	},
	roles: [{
		type: mongoose.Schema.ObjectId,
		ref: 'Role',
		autopopulate: true
	}]
});

worldSchema.methods.userCanRead = async function(user){
	return await userHasPermission(user, WORLD_READ, this._id);
};

worldSchema.plugin(mongooseAutopopulate);

worldSchema.plugin(mongoosePaginate);

export const World = mongoose.model('World', worldSchema);
