import mongoose, {Schema} from "mongoose";
import {PERMISSION_ASSIGNMENT, WORLD} from "@rpgtools/common/src/type-constants";
import {MongoDBDocument, PermissionControlledDocument} from "../../../types";
import {AclEntry} from "./acl-entry";

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
	acl: [AclEntry],
});

export interface RoleDocument extends MongoDBDocument, PermissionControlledDocument {
	name: string;
	world: Schema.Types.ObjectId;
}

export const RoleModel = mongoose.model<RoleDocument>("Role", roleSchema);
