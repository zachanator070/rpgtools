import mongoose from 'mongoose';
import {WikiPage} from "./wiki-page";
import {PLACE} from "../../../common/src/type-constants";
import {deleteImage} from "../resolvers/mutations/image-mutations";

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

placeSchema.pre('deleteOne', { document: true, query: false }, async function(){
	if(this.mapImage){
		await deleteImage(this.mapImage);
	}
});

export const Place = WikiPage.discriminator(PLACE, placeSchema);