import mongoose from "mongoose";
import { ALL_PERMISSIONS } from "../../../common/src/permission-constants";
import {
	PERMISSION_ASSIGNMENT,
	PERMISSION_CONTROLLED_TYPES,
} from "@rpgtools/common/src/type-constants";

const Schema = mongoose.Schema;

const permissionAssignmentSchema = new Schema({
	permission: {
		type: String,
		required: true,
		enum: ALL_PERMISSIONS,
		index: true,
	},
	subject: {
		type: mongoose.Schema.ObjectId,
		required: true,
		refPath: "subjectType",
		index: true,
	},
	subjectType: {
		type: String,
		required: true,
		enum: PERMISSION_CONTROLLED_TYPES,
	},
});

// you can only grant permissions for subjects that you are an admin of
permissionAssignmentSchema.methods.userCanWrite = async function (user) {
	if (this.subject instanceof mongoose.Types.ObjectId) {
		await this.populate("subject").execPopulate();
	}
	return await this.subject.userCanAdmin(user);
};

// you can only read permissions assigned if you can grant them or if you have access to the permission
permissionAssignmentSchema.methods.userCanRead = async function (user) {
	return (
		(await user.hasPermission(this.permission, this.subject)) ||
		(await this.userCanWrite(user))
	);
};

export const PermissionAssignment = mongoose.model(
	PERMISSION_ASSIGNMENT,
	permissionAssignmentSchema
);
