import mongoose from "mongoose";
import { PIN, PLACE, WIKI_PAGE } from "../../../../../common/src/type-constants";
import { PinDocument } from "../../../types";

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

export const PinModel = mongoose.model<PinDocument>(PIN, pinSchema);
