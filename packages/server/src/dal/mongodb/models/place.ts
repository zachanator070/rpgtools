import mongoose from "mongoose";
import {WikiPageModel} from "./wiki-page";
import {IMAGE, PLACE} from "@rpgtools/common/src/type-constants";
import {WikiPageDocument} from "../../../types";
import {v4} from "uuid";

export interface PlaceDocument extends WikiPageDocument {
    mapImage: string;
    pixelsPerFoot: number;
}

const placeSchema = new mongoose.Schema<PlaceDocument, mongoose.Model<PlaceDocument>>({
	_id: {
		type: String,
		default: v4
	},
	mapImage: {
		type: String,
		ref: IMAGE,
	},
	pixelsPerFoot: {
		type: Number,
	},
});

export const PlaceModel = WikiPageModel.discriminator<PlaceDocument, mongoose.Model<PlaceDocument>>(
	PLACE,
	placeSchema
);
