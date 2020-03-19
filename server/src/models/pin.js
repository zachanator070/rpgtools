import mongoose from 'mongoose';
import {Place} from './place';
import {WikiPage} from "./wiki-page";
import {PIN, PLACE} from "../../../common/src/type-constants";

const Schema = mongoose.Schema;

const pinSchema = new Schema({
	x: {
		type: Number,
		required: [true, 'x position required']
	},
	y: {
		type: Number,
		required: [true, 'y position required']
	},
	map: {
		type: mongoose.Schema.ObjectId,
		ref: PLACE,
		required: [true, 'map required']
	},
	page: {
		type: mongoose.Schema.ObjectId,
		ref: 'WikiPage',
	}
});

pinSchema.methods.userCanRead = async function(user){
	const map = await Place.findById(this.map);
	const page = await WikiPage.findById(this.page);
	return await map.userCanRead(user) && (page ? await page.userCanRead(user) : true);
};

pinSchema.methods.userCanWrite = async function(user){
	const map = await Place.findById(this.map);
	return await map.userCanWrite(user);
};

export const Pin = mongoose.model(PIN, pinSchema);
