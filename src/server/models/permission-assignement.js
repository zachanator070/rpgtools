import mongoose from 'mongoose';
import {ALL_PERMISSIONS} from '../../permission-constants';
import {getSubjectFromPermission} from "../authorization-helpers";
import {ALL_TYPES} from "../../wiki-page-types";

const Schema = mongoose.Schema;

const permissionAssignmentSchema = new Schema({
	permission: {
		type: String,
		required: true,
		enum: ALL_PERMISSIONS
	},
	subject: {
		type: mongoose.Schema.ObjectId,
		required: true,
		refPath: 'subjectType'
	},
	subjectType: {
		type: String,
		required: true,
		enum: [...ALL_TYPES, 'World', 'Role', 'WikiFolder', 'Game']
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
