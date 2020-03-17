import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-aggregate-paginate-v2'
import {WORLD_READ} from "../../permission-constants";
import {WORLD_OWNER} from "../../role-constants";
import {PIN, ROLE, WIKI_FOLDER, WIKI_PAGE, WORLD} from "../../type-constants";

const Schema = mongoose.Schema;

const worldSchema = new Schema({
	name: {
		type: String,
		required: [true, 'name field required']
	},
	wikiPage: {
		type: mongoose.Schema.ObjectId,
		ref: WIKI_PAGE,
	},
	rootFolder: {
		type: mongoose.Schema.ObjectId,
		ref: WIKI_FOLDER,
	},
	roles: [{
		type: mongoose.Schema.ObjectId,
		ref: ROLE,
	}],
	pins: [{
		type: mongoose.Schema.ObjectId,
		ref: PIN,
	}]
});

worldSchema.methods.userCanRead = async function(user){
	return await user.hasPermission(WORLD_READ, this._id);
};

// basically if the user can give out permissions defined in WORLD_PERMISSIONS and change the world name
worldSchema.methods.userCanWrite = async function(user){
	if(user){
		for(let role of user.roles){
			if(role.name === WORLD_OWNER){
				return true;
			}
		}
	}
	return false;
};

worldSchema.plugin(mongoosePaginate);

export const World = mongoose.model(WORLD, worldSchema);
