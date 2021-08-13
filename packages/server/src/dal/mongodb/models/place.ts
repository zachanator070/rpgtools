import { Schema } from "mongoose";
import { WikiPageModel } from "./wiki-page";
import { PLACE } from "../../../../../common/src/type-constants";
import { PlaceDocument } from "../../../types";

const placeSchema = new Schema<PlaceDocument>({
	mapImage: {
		type: Schema.Types.ObjectId,
		ref: "Image",
	},
	pixelsPerFoot: {
		type: Number,
	},
});

export const PlaceModel = WikiPageModel.discriminator<PlaceDocument>(PLACE, placeSchema);
