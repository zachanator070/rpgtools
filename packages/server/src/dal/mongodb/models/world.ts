import mongoose, {Schema} from "mongoose";
import {PLACE, WIKI_FOLDER, WORLD} from "@rpgtools/common/src/type-constants";
import {MongoDBDocument, PermissionControlledDocument} from "../../../types";
import {AclEntry} from "./acl-entry";

const worldSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "name field required"],
	},
	wikiPage: {
		type: mongoose.Schema.Types.ObjectId,
		ref: PLACE,
	},
	rootFolder: {
		type: mongoose.Schema.Types.ObjectId,
		ref: WIKI_FOLDER,
	},
	acl: [AclEntry],
});

export interface WorldDocument extends MongoDBDocument, PermissionControlledDocument {
    name: string;
    wikiPage: Schema.Types.ObjectId;
    rootFolder: Schema.Types.ObjectId;
    pins: Schema.Types.ObjectId[];
}

export const WorldModel = mongoose.model<WorldDocument>(WORLD, worldSchema);
