import mongoose from "mongoose";
import {PIN, PLACE, WIKI_PAGE, WORLD} from "@rpgtools/common/src/type-constants";
import {MongoDBDocument} from "../../../types";
import {v4} from "uuid";

const pinSchema = new mongoose.Schema({
	_id: {
		type: String,
		default: v4
	},
	x: {
		type: Number,
		required: [true, "x position required"],
	},
	y: {
		type: Number,
		required: [true, "y position required"],
	},
	map: {
		type: String,
		ref: PLACE,
		required: [true, "map required"],
	},
	page: {
		type: String,
		ref: WIKI_PAGE,
	},
	world: {
		type: String,
		ref: WORLD,
		required: [true, "world required"],
	},
});

export interface PinDocument extends MongoDBDocument {
    x: number;
    y: number;
    map: string;
    page: string;
	world: string;
}

export const PinModel = mongoose.model<PinDocument>(PIN, pinSchema);
