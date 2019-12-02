import mongoose from 'mongoose';
import {WikiPage} from "./wiki-page";

const Schema = mongoose.Schema;

const placeSchema = new Schema({
	coverImage: {
		type: mongoose.Schema.ObjectId,
		ref: 'Image'
	},
});

export const Place = WikiPage.discriminator('Place', placeSchema);