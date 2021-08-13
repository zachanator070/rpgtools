import mongoose, { Schema } from "mongoose";
import { PERMISSION_ASSIGNMENT, WORLD } from "../../../../../common/src/type-constants";
import { RoleDocument } from "../../../types";

const roleSchema = new Schema({
	name: {
		type: String,
		required: [true, "name field required"],
		index: true,
	},
	world: {
		type: Schema.Types.ObjectId,
		ref: WORLD,
		index: true,
	},
	permissions: [
		{
			type: Schema.Types.ObjectId,
			ref: PERMISSION_ASSIGNMENT,
		},
	],
});

export const RoleModel = mongoose.model<RoleDocument>("Role", roleSchema);
