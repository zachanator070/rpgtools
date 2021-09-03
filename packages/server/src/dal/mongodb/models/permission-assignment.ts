import mongoose from "mongoose";
import { ALL_PERMISSIONS } from "../../../../../common/src/permission-constants";
import {
	PERMISSION_ASSIGNMENT,
	PERMISSION_CONTROLLED_TYPES,
} from "../../../../../common/src/type-constants";
import { PermissionAssignmentDocument } from "../../../types";

const permissionAssignmentSchema = new mongoose.Schema({
	permission: {
		type: String,
		required: true,
		enum: ALL_PERMISSIONS,
		index: true,
	},
	subject: {
		type: mongoose.Schema.Types.ObjectId,
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

export const PermissionAssignmentModel = mongoose.model<PermissionAssignmentDocument>(
	PERMISSION_ASSIGNMENT,
	permissionAssignmentSchema
);
