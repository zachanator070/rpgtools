import mongoose, { Schema } from "mongoose";
import { MODEL, WORLD } from "../../../../../common/src/type-constants";
import { MongoDBEntity } from "../../../types";

export class ModelDocument extends MongoDBEntity {
	public world: Schema.Types.ObjectId;
	public name: string;
	public depth: number;
	public width: number;
	public height: number;
	public fileName: string;
	public fileId: string;
	public notes: string;
}

const modelSchema = new Schema({
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
