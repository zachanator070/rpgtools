import mongoose from 'mongoose';
import {CHUNK, IMAGE} from "../../../common/src/type-constants";

const chunkSchema = new mongoose.Schema({
	image: {
		type: mongoose.Schema.ObjectId,
		ref: IMAGE,
		required: [true, 'image id required']
	},
	x: {
		type: Number,
		required: [true, 'x position required']
	},
	y: {
		type: Number,
		required: [true, 'y position required']
	},
	width: {
		type: Number,
		required: [true, 'width required']
	},
	height: {
		type: Number,
		required: [true, 'height required']
	},
	fileId: {
		type: String,
		required: [true, 'fileId required']
	}
});

export const Chunk = mongoose.model(CHUNK, chunkSchema);
