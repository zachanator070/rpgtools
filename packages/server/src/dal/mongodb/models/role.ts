import mongoose from "mongoose";
import {WORLD} from "@rpgtools/common/src/type-constants";
import {MongoDBDocument, PermissionControlledDocument} from "../../../types";
import {AclEntry} from "./acl-entry";
import {v4} from "uuid";

const roleSchema = new mongoose.Schema({
	_id: {
		type: String,
		default: v4
	},
	name: {
		type: String,
		required: [true, "name field required"],
		index: true,
	},
	world: {
		type: String,
		ref: WORLD,
		index: true,
	},
	acl: [AclEntry],
});

export interface RoleDocument extends MongoDBDocument, PermissionControlledDocument {
	name: string;
	world: string;
}

export const RoleModel = mongoose.model<RoleDocument>("Role", roleSchema);
