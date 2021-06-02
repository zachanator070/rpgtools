import mongoose, { Schema } from "mongoose";
import { CHUNK, IMAGE } from "../../../../../common/src/type-constants";
import { MongoDBEntity } from "../../../types";

export class ChunkDocument extends MongoDBEntity {
	public image: Schema.Types.ObjectId;
	public x: number;
	public y: number;
	public width: number;
	public height: number;
	public fileId: string;
}

const chunkSchema = new Schema({
	image: {
		type: Schema.Types.ObjectId,
		ref: IMAGE,
		required: [true, "image id required"],
	},
	x: {
		type: Number,
		required: [true, "x position required"],
	},
	y: {
		type: Number,
		required: [true, "y position required"],
	},
	width: {
		type: Number,
		required: [true, "width required"],
	},
	height: {
		type: Number,
		required: [true, "height required"],
	},
	fileId: {
		type: String,
		required: [true, "fileId required"],
	},
});

export const ChunkModel = mongoose.model<ChunkDocument>(CHUNK, chunkSchema);
