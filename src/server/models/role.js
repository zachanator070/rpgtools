import mongoose from 'mongoose';
import mongooseAutopopulate from "mongoose-autopopulate";
import {userHasPermission} from "../authorization-helpers";
import {ROLE_ADMIN, ROLE_ADMIN_ALL} from "../../permission-constants";
import {ALL_USERS, EVERYONE} from "../../role-constants";

const Schema = mongoose.Schema;

const roleSchema = new Schema({
	name: {
		type: String,
		required: [true, 'name field required']
	},
	world: {
		type: mongoose.Schema.ObjectId,
		ref: 'World'
	},
	permissions: [{
		type: mongoose.Schema.ObjectId,
		ref: 'PermissionAssignment',
		autopopulate: true
	}]
});

roleSchema.methods.userCanWrite = async function(user) {
	return await userHasPermission(user, ROLE_ADMIN, this._id) || await userHasPermission(user, ROLE_ADMIN_ALL, this.world);
};

roleSchema.methods.userCanRead = async function(user){
	return await this.userCanWrite(user) || this.name === EVERYONE || this.name === ALL_USERS;
};

roleSchema.plugin(mongooseAutopopulate);

export const Role = mongoose.model('Role', roleSchema);
