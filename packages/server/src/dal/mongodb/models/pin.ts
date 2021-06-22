import mongoose, { Schema } from "mongoose";
import { PIN, PLACE, WIKI_PAGE } from "../../../../../common/src/type-constants";
import { MongoDBEntity } from "../../../types";

export class PinDocument extends MongoDBEntity {
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

export const PinModel = mongoose.model<PinDocument>(PIN, pinSchema);
