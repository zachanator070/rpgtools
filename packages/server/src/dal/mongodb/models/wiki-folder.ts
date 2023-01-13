import mongoose from "mongoose";
import {WIKI_FOLDER, WIKI_PAGE, WORLD} from "@rpgtools/common/src/type-constants";
import {MongoDBDocument, PermissionControlledDocument} from "../../../types";
import {AclEntry} from "./acl-entry";
import {v4} from "uuid";

const wikiFolderSchema = new mongoose.Schema({
	_id: {
		type: String,
		default: v4
	},
	name: {
		type: String,
		required: [true, "name field required"],
	},
	world: {
		type: String,
		required: [true, "world field required"],
		ref: WORLD,
	},
	pages: [
		{
			type: String,
			ref: WIKI_PAGE,
		},
	],
	children: [
		{
			type: String,
			ref: WIKI_FOLDER,
		},
	],
	acl: [AclEntry],
});

export interface WikiFolderDocument extends MongoDBDocument, PermissionControlledDocument {
    name: string;
    world: string;
    pages: string[];
    children: string[];
}

export const WikiFolderModel = mongoose.model<WikiFolderDocument>(WIKI_FOLDER, wikiFolderSchema);
