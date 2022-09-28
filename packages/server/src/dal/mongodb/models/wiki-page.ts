import mongoose from "mongoose";
import { IMAGE, WIKI_PAGE, WORLD } from "@rpgtools/common/src/type-constants";
import { WikiPageDocument } from "../../../types";
import {AclEntry} from "./acl-entry";

const wikiPageSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "name field required"],
		},
		world: {
			type: mongoose.Schema.Types.ObjectId,
			required: [true, "world field required"],
			ref: WORLD,
		},
		acl: [AclEntry],
		coverImage: {
			type: mongoose.Schema.Types.ObjectId,
			ref: IMAGE,
		},
		contentId: {
			type: mongoose.Schema.Types.ObjectId,
		}
	},
	{
		discriminatorKey: "type",
	}
);

export const WikiPageModel = mongoose.model<WikiPageDocument>(WIKI_PAGE, wikiPageSchema);
