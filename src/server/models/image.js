import mongoose from 'mongoose';
import mongooseAutopopulate from "mongoose-autopopulate";
import {CHUNK, IMAGE, WORLD} from "../../type-constants";

const Schema = mongoose.Schema;

const imageSchema = new Schema({
	world: {
		type: mongoose.Schema.ObjectId,
		ref: WORLD,
		required: [true, 'worldId required']
	},
	width: {
		type: Number,
		required: [true, 'width required']
	},
	height: {
		type: Number,
		required: [true, 'width required']
	},
	chunkWidth: {
		type: Number,
	},
	chunkHeight: {
		type: Number,
	},
	chunks: [{
		type: mongoose.Schema.ObjectId,
		ref: CHUNK,
		autopopulate: true
	}],
	icon: {
		type: mongoose.Schema.ObjectId,
		ref: IMAGE,
		autopopulate: true
	},
	name: {
		type: String,
		required: [true, 'name required']
	},
});

imageSchema.plugin(mongooseAutopopulate);

export const Image = mongoose.model(IMAGE, imageSchema);
