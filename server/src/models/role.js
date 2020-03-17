import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2'
import {ROLE_ADMIN, ROLE_ADMIN_ALL} from "../../../common/permission-constants";
import {ALL_USERS, EVERYONE} from "../../../common/role-constants";
import {PERMISSION_ASSIGNMENT, WORLD} from "../../../common/type-constants";

const Schema = mongoose.Schema;

const roleSchema = new Schema({
	name: {
		type: String,
		required: [true, 'name field required'],
		index: true
	},
	world: {
		type: mongoose.Schema.ObjectId,
		ref: WORLD,
		index: true
	},
	permissions: [{
		type: mongoose.Schema.ObjectId,
		ref: PERMISSION_ASSIGNMENT,
	}]
});

roleSchema.methods.userCanWrite = async function(user) {
	return await user.hasPermission(ROLE_ADMIN, this._id) || await user.hasPermission(ROLE_ADMIN_ALL, this.world);
};

roleSchema.methods.userCanRead = async function(user){
	return await this.userCanWrite(user) || this.name === EVERYONE || this.name === ALL_USERS;
};

roleSchema.plugin(mongoosePaginate);

export const Role = mongoose.model('Role', roleSchema);
