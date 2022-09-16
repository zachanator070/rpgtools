import mongoose, {Schema} from "mongoose";
import {WikiPageModel} from "./wiki-page";
import {PLACE} from "@rpgtools/common/src/type-constants";
import {WikiPageDocument} from "../../../types";

export interface PlaceDocument extends WikiPageDocument {
    mapImage: Schema.Types.ObjectId;
    pixelsPerFoot: number;
}

const placeSchema = new mongoose.Schema<PlaceDocument, mongoose.Model<PlaceDocument>>({
	mapImage: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Image",
	},
	pixelsPerFoot: {
		type: Number,
	},
});

export const PlaceModel = WikiPageModel.discriminator<PlaceDocument, mongoose.Model<PlaceDocument>>(
	PLACE,
	placeSchema
);
