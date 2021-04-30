import mongoose from "mongoose";
import { MODEL, PERSON } from "../../../common/src/type-constants";
import { WikiPage } from "./wiki-page";

const Schema = mongoose.Schema;

const personSchema = new Schema({
	model: {
		type: mongoose.Schema.ObjectId,
		ref: MODEL,
	},
	modelColor: {
		type: String,
	},
});

export const Person = WikiPage.discriminator(PERSON, personSchema);
