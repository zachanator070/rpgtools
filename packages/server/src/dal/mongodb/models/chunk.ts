import mongoose from "mongoose";
import {CHUNK, IMAGE} from "@rpgtools/common/src/type-constants";
import {MongoDBDocument} from "../../../types";
import {v4} from "uuid";

const chunkSchema = new mongoose.Schema({
	_id: {
		type: String,
		default: v4
	},
	image: {
		type: String,
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
    image: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fileId: string;
}

export const ChunkModel = mongoose.model<ChunkDocument>(CHUNK, chunkSchema);
