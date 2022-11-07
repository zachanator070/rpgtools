import mongoose from "mongoose";
import {SERVER_CONFIG, USER} from "@rpgtools/common/src/type-constants";
import {MongoDBDocument, PermissionControlledDocument} from "../../../types";
import {AclEntry} from "./acl-entry";
import {v4} from "uuid";

const serverSchema = new mongoose.Schema({
	_id: {
		type: String,
		default: v4
	},
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
			type: String,
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
    adminUsers: string[];
    unlockCode: string;
}

export const ServerConfigModel = mongoose.model<ServerConfigDocument>(SERVER_CONFIG, serverSchema);
