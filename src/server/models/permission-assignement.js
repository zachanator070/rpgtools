import mongoose from 'mongoose';
import {ALL_PERMISSIONS, ROLE_ADMIN} from '../../permission-constants';
import {getWorldFromPermission, userHasPermission} from "../authorization-helpers";

const Schema = mongoose.Schema;

const permissionAssignmentSchema = new Schema({
	permission: {
		type: String,
		enum: ALL_PERMISSIONS
	},
	subjectId: {
		type: mongoose.Schema.ObjectId
	}
});

permissionAssignmentSchema.methods.userCanWrite = async function(user) {
	const world = await getWorldFromPermission(this.permission, this.subjectId);
	if(world){
		return await userHasPermission(user, ROLE_ADMIN, world._id);
	}
	else {
		return false;
	}
};

permissionAssignmentSchema.methods.userCanRead = async function(user){
	return await this.userCanWrite(user);
};

export const PermissionAssignment = mongoose.model('PermissionAssignment', permissionAssignmentSchema);
