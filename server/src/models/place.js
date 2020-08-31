import mongoose from 'mongoose';
import {WikiPage} from "./wiki-page";
import {PLACE} from "../../../common/src/type-constants";

const Schema = mongoose.Schema;

const placeSchema = new Schema({
	mapImage: {
		type: mongoose.Schema.ObjectId,
		ref: 'Image',
	},
	pixelsPerFoot: {
		type: Number
	}
});

export const Place = WikiPage.discriminator(PLACE, placeSchema);