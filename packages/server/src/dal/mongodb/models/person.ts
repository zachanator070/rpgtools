import mongoose from "mongoose";
import {MODEL, PERSON} from "@rpgtools/common/src/type-constants";
import {WikiPageModel} from "./wiki-page";
import {ModeledWikiDocument} from "../../../types";
import {v4} from "uuid";

export interface PersonDocument extends ModeledWikiDocument {
}

const personSchema = new mongoose.Schema<PersonDocument, mongoose.Model<PersonDocument>>({
	_id: {
		type: String,
		default: v4
	},
	pageModel: {
		type: String,
		ref: MODEL,
	},
	modelColor: {
		type: String,
	},
});

export const PersonModel = WikiPageModel.discriminator<
	PersonDocument,
	mongoose.Model<PersonDocument>
>(PERSON, personSchema);
