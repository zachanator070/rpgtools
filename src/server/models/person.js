import mongoose from 'mongoose';
import {WikiPage} from "./wiki-page";
import mongooseAutopopulate from "mongoose-autopopulate";
import {PERSON} from "../../type-constants";

const Schema = mongoose.Schema;

const personSchema = new Schema({
	type: {type: String, default: PERSON},
});

personSchema.plugin(mongooseAutopopulate);

export const Person = WikiPage.discriminator(PERSON, personSchema);