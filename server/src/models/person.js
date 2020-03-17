import mongoose from 'mongoose';
import {WikiPage} from "./wiki-page";
import {PERSON} from "../../../common/type-constants";

const Schema = mongoose.Schema;

const personSchema = new Schema({
	type: {type: String, default: PERSON},
});

export const Person = WikiPage.discriminator(PERSON, personSchema);