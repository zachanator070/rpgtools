import mongoose, {Schema} from "mongoose";
import {MODEL, WORLD} from "@rpgtools/common/src/type-constants";
import {MongoDBDocument, PermissionControlledDocument} from "../../../types";
import {AclEntry} from "./acl-entry";

const modelSchema = new mongoose.Schema({
	world: {
		type: mongoose.Schema.Types.ObjectId,
		ref: WORLD,
	},
	name: {
		type: String,
		required: [true, "name required"],
	},
	depth: {
		type: Number,
		required: [true, "depth required"],
	},
	width: {
		type: Number,
		required: [true, "width required"],
	},
	height: {
		type: Number,
		required: [true, "height required"],
	},
	fileName: {
		type: String,
		required: [true, "fileName required"],
	},
	fileId: {
		type: String,
	},
	notes: {
		type: String,
	},
	acl: [AclEntry],
});

export interface ModelDocument extends MongoDBDocument, PermissionControlledDocument {
    world: Schema.Types.ObjectId;
    name: string;
    depth: number;
    width: number;
    height: number;
    fileName: string;
    fileId: string;
    notes: string;
}

export const ModelModel = mongoose.model<ModelDocument>(MODEL, modelSchema);
