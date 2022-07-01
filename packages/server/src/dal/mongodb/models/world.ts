import mongoose from "mongoose";
import { PIN, PLACE, ROLE, WIKI_FOLDER, WORLD } from "@rpgtools/common/src/type-constants";
import { WorldDocument } from "../../../types";

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
	roles: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: ROLE,
		},
	],
	pins: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: PIN,
		},
	],
});

export const WorldModel = mongoose.model<WorldDocument>(WORLD, worldSchema);
