import mongoose from 'mongoose';
import {ALL_PERMISSIONS} from '../../permission-constants';

const Schema = mongoose.Schema;

const permissionAssignmentSchema = Schema({
	permission: {
		type: String,
		enum: ALL_PERMISSIONS
	},
	subject: {
		type: mongoose.Schema.ObjectId
	}
});

const PermissionAssignment = mongoose.model('PermissionAssignment', permissionAssignmentSchema);

export default PermissionAssignment;
