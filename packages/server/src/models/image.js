import mongoose from "mongoose";
import { CHUNK, IMAGE, WORLD } from "@rpgtools/common/src/type-constants";

const Schema = mongoose.Schema;

const imageSchema = new Schema({
	world: {
		type: mongoose.Schema.ObjectId,
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
			type: mongoose.Schema.ObjectId,
			ref: CHUNK,
		},
	],
	icon: {
		type: mongoose.Schema.ObjectId,
		ref: IMAGE,
	},
	name: {
		type: String,
		required: [true, "name required"],
	},
});

export const Image = mongoose.model(IMAGE, imageSchema);
