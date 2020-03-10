import mongoose from 'mongoose';
import {WikiPage} from "./wiki-page";
import mongooseAutopopulate from "mongoose-autopopulate";
import {PLACE} from "../../type-constants";

const Schema = mongoose.Schema;

const placeSchema = new Schema({
	mapImage: {
		type: mongoose.Schema.ObjectId,
		ref: 'Image',
		autopopulate: true
	},
	type: {type: String, default: PLACE},
});

placeSchema.plugin(mongooseAutopopulate);

export const Place = WikiPage.discriminator(PLACE, placeSchema);