import mongoose from 'mongoose';
import {ALL_PERMISSIONS} from '../../../common/permission-constants';
import {
	PERMISSION_ASSIGNMENT,
	PERMISSION_CONTROLLED_TYPES,
} from "../../../common/type-constants";
import {ObjectId} from "bson";

const Schema = mongoose.Schema;

const permissionAssignmentSchema = new Schema({
	permission: {
		type: String,
		required: true,
		enum: ALL_PERMISSIONS,
		index: true
	},
	subject: {
		type: mongoose.Schema.ObjectId,
		required: true,
		refPath: 'subjectType',
		index: true
	},
	subjectType: {
		type: String,
		required: true,
		enum: PERMISSION_CONTROLLED_TYPES
	}
});

permissionAssignmentSchema.methods.userCanWrite = async function(user){
	if(this.subject instanceof ObjectId){
		await this.populate('subject').execPopulate();
	}
	return await this.subject.userCanWrite(user);
};

permissionAssignmentSchema.methods.userCanRead = async function(user){
	if(this.subject instanceof ObjectId){
		await this.populate('subject').execPopulate();
	}
	return await this.subject.userCanRead(user);
};

export const PermissionAssignment = mongoose.model(PERMISSION_ASSIGNMENT, permissionAssignmentSchema);
