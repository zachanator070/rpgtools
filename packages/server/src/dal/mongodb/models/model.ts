import mongoose from "mongoose";
import { MODEL, WORLD } from "../../../../../common/src/type-constants";
import { ModelDocument } from "../../../types";

const modelSchema = new mongoose.Schema({
	world: {
		type: mongoose.Schema.Types.ObjectId,
		ref: WORLD,
	},
	name: {
		type: String,
		required: [true, "name required"],
	},
	depth: {
		type: Number,
		required: [true, "depth required"],
	},
	width: {
		type: Number,
		required: [true, "width required"],
	},
	height: {
		type: Number,
		required: [true, "height required"],
	},
	fileName: {
		type: String,
		required: [true, "fileName required"],
	},
	fileId: {
		type: String,
	},
	notes: {
		type: String,
	},
});

export const ModelModel = mongoose.model<ModelDocument>(MODEL, modelSchema);
