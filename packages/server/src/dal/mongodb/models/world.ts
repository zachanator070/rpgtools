import mongoose, { Schema } from "mongoose";
import { PIN, PLACE, ROLE, WIKI_FOLDER, WORLD } from "../../../../../common/src/type-constants";
import {WorldDocument} from "../../../types";

const worldSchema = new Schema({
	name: {
		type: String,
		required: [true, "name field required"],
	},
	wikiPage: {
		type: Schema.Types.ObjectId,
		ref: PLACE,
	},
	rootFolder: {
		type: Schema.Types.ObjectId,
		ref: WIKI_FOLDER,
	},
	roles: [
		{
			type: Schema.Types.ObjectId,
			ref: ROLE,
		},
	],
	pins: [
		{
			type: Schema.Types.ObjectId,
			ref: PIN,
		},
	],
});

export const WorldModel = mongoose.model<WorldDocument>(WORLD, worldSchema);
