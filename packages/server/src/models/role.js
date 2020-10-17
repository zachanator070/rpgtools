import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2'
import {
	ROLE_ADMIN,
	ROLE_ADMIN_ALL,
	ROLE_READ,
	ROLE_READ_ALL,
	ROLE_RW,
	ROLE_RW_ALL
} from "../../../common/src/permission-constants";
import {ALL_USERS, EVERYONE} from "../../../common/src/role-constants";
import {PERMISSION_ASSIGNMENT, WORLD} from "../../../common/src/type-constants";

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

roleSchema.methods.userCanAdmin = async function(user) {
	return await user.hasPermission(ROLE_ADMIN, this._id) || await user.hasPermission(ROLE_ADMIN_ALL, this.world);
};

roleSchema.methods.userCanWrite = async function(user) {
	return await user.hasPermission(ROLE_RW, this._id) || await user.hasPermission(ROLE_RW_ALL, this.world);
};

roleSchema.methods.userCanRead = async function(user){
	return await this.userCanWrite(user) ||
		await user.hasPermission(ROLE_READ, this._id) ||
		await user.hasPermission(ROLE_READ_ALL, this.world) ||
		await user.hasRole(this) ||
		this.name === EVERYONE ||
		this.name === ALL_USERS;
};

roleSchema.plugin(mongoosePaginate);

export const Role = mongoose.model('Role', roleSchema);
