import mongoose, {Schema} from "mongoose";
import {CHUNK, IMAGE, WORLD} from "@rpgtools/common/src/type-constants";
import {MongoDBDocument} from "../../../types";

const imageSchema = new mongoose.Schema({
	world: {
		type: mongoose.Schema.Types.ObjectId,
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
			type: mongoose.Schema.Types.ObjectId,
			ref: CHUNK,
		},
	],
	icon: {
		type: mongoose.Schema.Types.ObjectId,
		ref: IMAGE,
	},
	name: {
		type: String,
		required: [true, "name required"],
	},
});

export interface ImageDocument extends MongoDBDocument {
    world: Schema.Types.ObjectId;
    width: number;
    height: number;
    chunkWidth: number;
    chunkHeight: number;
    chunks: Schema.Types.ObjectId[];
    icon: Schema.Types.ObjectId;
    name: string;
}

export const ImageModel = mongoose.model<ImageDocument>(IMAGE, imageSchema);
