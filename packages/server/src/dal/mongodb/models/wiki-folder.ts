import mongoose from "mongoose";
import { WIKI_FOLDER, WIKI_PAGE, WORLD } from "../../../../../common/src/type-constants";
import { WikiFolderDocument } from "../../../types";

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
});

export const WikiFolderModel = mongoose.model<WikiFolderDocument>(WIKI_FOLDER, wikiFolderSchema);
