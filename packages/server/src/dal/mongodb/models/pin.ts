import mongoose, {Schema} from "mongoose";
import {PIN, PLACE, WIKI_PAGE} from "@rpgtools/common/src/type-constants";
import {MongoDBDocument} from "../../../types";

const pinSchema = new mongoose.Schema({
	x: {
		type: Number,
		required: [true, "x position required"],
	},
	y: {
		type: Number,
		required: [true, "y position required"],
	},
	map: {
		type: mongoose.Schema.Types.ObjectId,
		ref: PLACE,
		required: [true, "map required"],
	},
	page: {
		type: mongoose.Schema.Types.ObjectId,
		ref: WIKI_PAGE,
	},
});

export interface PinDocument extends MongoDBDocument {
    x: number;
    y: number;
    map: Schema.Types.ObjectId;
    page: Schema.Types.ObjectId;
}

export const PinModel = mongoose.model<PinDocument>(PIN, pinSchema);
