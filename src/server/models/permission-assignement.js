import mongoose from 'mongoose';
import {ALL_PERMISSIONS} from '../../permission-constants';
import {getSubjectFromPermission, getWorldFromPermission, userHasPermission} from "../authorization-helpers";

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
	const subject = await getSubjectFromPermission(this.permission, this.subjectId);
	if(subject){
		return await subject.userCanWrite(user);
	}
	else {
		return false;
	}
};

permissionAssignmentSchema.methods.userCanRead = async function(user){
	return await this.userCanWrite(user);
};

export const PermissionAssignment = mongoose.model('PermissionAssignment', permissionAssignmentSchema);
