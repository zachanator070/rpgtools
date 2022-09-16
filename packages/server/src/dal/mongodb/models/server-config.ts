import mongoose, {Schema} from "mongoose";
import {SERVER_CONFIG, USER} from "@rpgtools/common/src/type-constants";
import {MongoDBDocument, PermissionControlledDocument} from "../../../types";
import {AclEntry} from "./acl-entry";

const serverSchema = new mongoose.Schema({
	version: {
		type: String,
		required: true,
	},
	registerCodes: [
		{
			type: String,
		},
	],
	adminUsers: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: USER,
		},
	],
	unlockCode: {
		type: String,
	},
	acl: [AclEntry],
});

export interface ServerConfigDocument extends MongoDBDocument, PermissionControlledDocument {
    version: string;
    registerCodes: string[];
    adminUsers: Schema.Types.ObjectId[];
    unlockCode: string;
}

export const ServerConfigModel = mongoose.model<ServerConfigDocument>(SERVER_CONFIG, serverSchema);
