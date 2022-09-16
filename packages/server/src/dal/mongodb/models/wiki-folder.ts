import mongoose, {Schema} from "mongoose";
import {WIKI_FOLDER, WIKI_PAGE, WORLD} from "@rpgtools/common/src/type-constants";
import {MongoDBDocument, PermissionControlledDocument} from "../../../types";
import {AclEntry} from "./acl-entry";

const wikiFolderSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "name field required"],
	},
	world: {
		type: mongoose.Schema.Types.ObjectId,
		required: [true, "world field required"],
		ref: WORLD,
	},
	pages: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: WIKI_PAGE,
		},
	],
	children: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: WIKI_FOLDER,
		},
	],
	acl: [AclEntry],
});

export interface WikiFolderDocument extends MongoDBDocument, PermissionControlledDocument {
    name: string;
    world: Schema.Types.ObjectId;
    pages: Schema.Types.ObjectId[];
    children: Schema.Types.ObjectId[];
}

export const WikiFolderModel = mongoose.model<WikiFolderDocument>(WIKI_FOLDER, wikiFolderSchema);
