import mongoose from 'mongoose';
import {WikiPage} from "./wiki-page";
import mongooseAutopopulate from "mongoose-autopopulate";

const Schema = mongoose.Schema;

const placeSchema = new Schema({
	mapImage: {
		type: mongoose.Schema.ObjectId,
		ref: 'Image',
		autopopulate: true
	},
	type: {type: String, default: "Place"},
});

placeSchema.plugin(mongooseAutopopulate);

export const Place = WikiPage.discriminator('Place', placeSchema);