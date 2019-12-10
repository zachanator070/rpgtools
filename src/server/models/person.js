import mongoose from 'mongoose';
import {WikiPage} from "./wiki-page";
import mongooseAutopopulate from "mongoose-autopopulate";

const Schema = mongoose.Schema;

const personSchema = new Schema({
	type: {type: String, default: "Person"},
});

personSchema.plugin(mongooseAutopopulate);

export const Person = WikiPage.discriminator('Person', personSchema);