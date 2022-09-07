import mongoose from "mongoose";
import {IMAGE, PIN, PLACE, WIKI_PAGE} from "@rpgtools/common/src/type-constants";
import { PinDocument } from "../../../types";
import {PIN_BUILT_IN_ICONS} from "@rpgtools/common/src/pin-constants";

const pinIconSchema = new mongoose.Schema({
	builtInIcon: {
		type: String,
		enum: PIN_BUILT_IN_ICONS
	},
	color: {
		type: String
	},
	size: {
		type: Number,
		required: [true, "pin icon size required"],
	},
	image: {
		type: mongoose.Schema.Types.ObjectId,
		ref: IMAGE,
	}
});

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
	icon: pinIconSchema
});

export const PinModel = mongoose.model<PinDocument>(PIN, pinSchema);
