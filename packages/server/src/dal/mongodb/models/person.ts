import {Model, Schema} from "mongoose";
import { MODEL, PERSON } from "../../../../../common/src/type-constants";
import { WikiPageModel } from "./wiki-page";
import { PersonDocument } from "../../../types";

const personSchema = new Schema<PersonDocument, Model<PersonDocument>>({
	model: {
		type: Schema.Types.ObjectId,
		ref: MODEL,
	},
	modelColor: {
		type: String,
	},
});

export const PersonModel = WikiPageModel.discriminator<PersonDocument, Model<PersonDocument>>(PERSON, personSchema);
