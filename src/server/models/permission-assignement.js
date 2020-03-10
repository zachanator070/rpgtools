import mongoose from 'mongoose';
import {ALL_PERMISSIONS} from '../../permission-constants';
import {ALL_WIKI_TYPES, GAME, PERMISSION_ASSIGNMENT, PIN, ROLE, SERVER, WIKI_FOLDER, WORLD} from "../../type-constants";

export const SUBJECT_TYPES = [...ALL_WIKI_TYPES, WORLD, ROLE, WIKI_FOLDER, GAME, PIN, SERVER];

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
		enum: SUBJECT_TYPES
	}
});

permissionAssignmentSchema.methods.userCanWrite = async function(user) {
	await this.populate('subject').execPopulate();
	return await this.subject.userCanWrite(user);
};

permissionAssignmentSchema.methods.userCanRead = async function(user){
	return await this.userCanWrite(user);
};

export const PermissionAssignment = mongoose.model(PERMISSION_ASSIGNMENT, permissionAssignmentSchema);
