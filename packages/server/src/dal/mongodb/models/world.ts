import mongoose from "mongoose";
import {PLACE, WIKI_FOLDER, WORLD} from "@rpgtools/common/src/type-constants";
import {MongoDBDocument, PermissionControlledDocument} from "../../../types";
import {AclEntry} from "./acl-entry";
import {v4} from "uuid";

const worldSchema = new mongoose.Schema({
	_id: {
		type: String,
		default: v4
	},
	name: {
		type: String,
		required: [true, "name field required"],
	},
	wikiPage: {
		type: String,
		ref: PLACE,
	},
	rootFolder: {
		type: String,
		ref: WIKI_FOLDER,
	},
	acl: [AclEntry],
});

export interface WorldDocument extends MongoDBDocument, PermissionControlledDocument {
    name: string;
    wikiPage: string;
    rootFolder: string;
    pins: string[];
}

export const WorldModel = mongoose.model<WorldDocument>(WORLD, worldSchema);
