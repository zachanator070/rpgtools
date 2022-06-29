import mongoose from "mongoose";
import { PERMISSION_ASSIGNMENT, WORLD } from "@rpgtools/common/src/type-constants";
import { RoleDocument } from "../../../types";

const roleSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "name field required"],
		index: true,
	},
	world: {
		type: mongoose.Schema.Types.ObjectId,
		ref: WORLD,
		index: true,
	},
	permissions: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: PERMISSION_ASSIGNMENT,
		},
	],
});

export const RoleModel = mongoose.model<RoleDocument>("Role", roleSchema);
