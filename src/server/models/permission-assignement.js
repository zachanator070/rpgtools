import mongoose from 'mongoose';
import {ALL_PERMISSIONS} from '../../permission-constants';
import mongooseAutopopulate from "mongoose-autopopulate";
import {
	PERMISSION_ASSIGNMENT,
	PERMISSION_CONTROLLED_TYPES,
} from "../../type-constants";

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
		refPath: 'subjectType',
		autopopulate: true
	},
	subjectType: {
		type: String,
		required: true,
		enum: PERMISSION_CONTROLLED_TYPES
	}
});

permissionAssignmentSchema.methods.userCanWrite = async function(user) {
	await this.populate('subject').execPopulate();
	return await this.subject.userCanWrite(user);
};

permissionAssignmentSchema.methods.userCanRead = async function(user){
	return await this.userCanWrite(user);
};

permissionAssignmentSchema.plugin(mongooseAutopopulate);

export const PermissionAssignment = mongoose.model(PERMISSION_ASSIGNMENT, permissionAssignmentSchema);
