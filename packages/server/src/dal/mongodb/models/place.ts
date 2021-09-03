import mongoose from "mongoose";
import { WikiPageModel } from "./wiki-page";
import { PLACE } from "../../../../../common/src/type-constants";
import { PlaceDocument } from "../../../types";

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
