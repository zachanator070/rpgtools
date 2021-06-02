import mongoose, {Schema} from "mongoose";
import { Place } from "./place";
import { WikiPageModel } from "./wiki-page";
import { PIN, PLACE, WIKI_PAGE } from "../../../../../common/src/type-constants";
import {MongoDBEntity} from "../../../types";

export class PinDocument extends MongoDBEntity{
	public x: number;
	public y: number;
	public map: Schema.Types.ObjectId;
	public page: Schema.Types.ObjectId;
}

const pinSchema = new Schema({
	x: {
		type: Number,
		required: [true, "x position required"],
	},
	y: {
		type: Number,
		required: [true, "y position required"],
	},
	map: {
		type: Schema.Types.ObjectId,
		ref: PLACE,
		required: [true, "map required"],
	},
	page: {
		type: Schema.Types.ObjectId,
		ref: WIKI_PAGE,
	},
});

pinSchema.methods.userCanRead = async function (user) {
	const map = await Place.findById(this.map);
	const page = await WikiPageModel.findById(this.page);
	return (await map.userCanRead(user)) && (page ? await page.userCanRead(user) : true);
};

pinSchema.methods.userCanWrite = async function (user) {
	const map = await Place.findById(this.map);
	return await map.userCanWrite(user);
};

export const PinModel = mongoose.model<PinDocument>(PIN, pinSchema);
