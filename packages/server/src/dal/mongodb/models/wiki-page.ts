import mongoose from "mongoose";
import { IMAGE, WIKI_PAGE, WORLD } from "@rpgtools/common/src/type-constants";
import { WikiPageDocument } from "../../../types";
import {AclEntry} from "./acl-entry";
import {v4} from "uuid";

const wikiPageSchema = new mongoose.Schema(
	{
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
		acl: [AclEntry],
		coverImage: {
			type: String,
			ref: IMAGE,
		},
		contentId: {
			type: String,
		}
	},
	{
		discriminatorKey: "type",
	}
);

export const WikiPageModel = mongoose.model<WikiPageDocument>(WIKI_PAGE, wikiPageSchema);
