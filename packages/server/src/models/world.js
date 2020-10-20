import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-aggregate-paginate-v2'
import {ROLE_ADMIN_ALL, WORLD_ADMIN, WORLD_READ, WORLD_READ_ALL} from "@rpgtools/common/src/permission-constants";
import {WORLD_OWNER} from "@rpgtools/common/src/role-constants";
import {MODEL, PIN, PLACE, ROLE, WIKI_FOLDER, WIKI_PAGE, WORLD} from "@rpgtools/common/src/type-constants";
import {ServerConfig} from "./server-config";

const Schema = mongoose.Schema;

const worldSchema = new Schema({
	name: {
		type: String,
		required: [true, 'name field required']
	},
	wikiPage: {
		type: mongoose.Schema.ObjectId,
		ref: PLACE,
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
	}],
});

worldSchema.methods.userCanAdmin = async function(user) {
	return await user.hasPermission(WORLD_ADMIN, this._id) || await user.hasPermission(ROLE_ADMIN_ALL, this.world);
};

worldSchema.methods.userCanRead = async function(user){
	const serverConfig = await ServerConfig.findOne();
	return await user.hasPermission(WORLD_READ, this._id) || (serverConfig && await user.hasPermission(WORLD_READ_ALL, serverConfig._id));
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
