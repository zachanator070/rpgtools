import mongoose from 'mongoose';
import {WikiPage} from "./wiki-page";
import {PLACE} from "../../../common/type-constants";

const Schema = mongoose.Schema;

const placeSchema = new Schema({
	mapImage: {
		type: mongoose.Schema.ObjectId,
		ref: 'Image',
	},
	type: {type: String, default: PLACE},
});

export const Place = WikiPage.discriminator(PLACE, placeSchema);