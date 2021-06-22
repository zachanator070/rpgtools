import { Schema } from "mongoose";
import { WikiPageModel, WikiPageDocument } from "./wiki-page";
import { PLACE } from "../../../../../common/src/type-constants";

export class PlaceDocument extends WikiPageDocument {
	public mapImage: Schema.Types.ObjectId;
	public pixelsPerFoot: number;
}

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
