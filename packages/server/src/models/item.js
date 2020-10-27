import mongoose from "mongoose";
import { ITEM, MODEL, PERSON } from "@rpgtools/common/src/type-constants";
import { WikiPage } from "./wiki-page";

const Schema = mongoose.Schema;

const itemSchema = new Schema({
	model: {
		type: mongoose.Schema.ObjectId,
		ref: MODEL,
	},
	modelColor: {
		type: String,
	},
});

export const Item = WikiPage.discriminator(ITEM, itemSchema);
