import mongoose from "mongoose";
import {CHUNK, IMAGE, WORLD} from "@rpgtools/common/src/type-constants";
import {MongoDBDocument} from "../../../types";
import {v4} from "uuid";

const imageSchema = new mongoose.Schema({
	_id: {
		type: String,
		default: v4
	},
	world: {
		type: String,
		ref: WORLD,
		required: [true, "worldId required"],
	},
	width: {
		type: Number,
		required: [true, "width required"],
	},
	height: {
		type: Number,
		required: [true, "height required"],
	},
	chunkWidth: {
		type: Number,
	},
	chunkHeight: {
		type: Number,
	},
	chunks: [
		{
			type: String,
			ref: CHUNK,
		},
	],
	icon: {
		type: String,
		ref: IMAGE,
	},
	name: {
		type: String,
		required: [true, "name required"],
	},
});

export interface ImageDocument extends MongoDBDocument {
    world: string;
    width: number;
    height: number;
    chunkWidth: number;
    chunkHeight: number;
    chunks: string[];
    icon: string;
    name: string;
}

export const ImageModel = mongoose.model<ImageDocument>(IMAGE, imageSchema);
