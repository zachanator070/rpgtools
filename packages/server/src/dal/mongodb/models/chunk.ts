import mongoose, {Schema} from "mongoose";
import {CHUNK, IMAGE} from "@rpgtools/common/src/type-constants";
import {MongoDBDocument} from "../../../types";

const chunkSchema = new mongoose.Schema({
	image: {
		type: mongoose.Schema.Types.ObjectId,
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

export interface ChunkDocument extends MongoDBDocument {
    image: Schema.Types.ObjectId;
    x: number;
    y: number;
    width: number;
    height: number;
    fileId: string;
}

export const ChunkModel = mongoose.model<ChunkDocument>(CHUNK, chunkSchema);
