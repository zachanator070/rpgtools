import mongoose from 'mongoose';
import mongooseAutopopulate from "mongoose-autopopulate";

const Schema = mongoose.Schema;

const imageSchema = new Schema({
	world: {
		type: mongoose.Schema.ObjectId,
		ref: 'World',
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
		ref: 'Chunk',
		autopopulate: true
	}],
	icon: {
		type: mongoose.Schema.ObjectId,
		ref: 'Image'
	},
	name: String
});

imageSchema.plugin(mongooseAutopopulate);

export const Image = mongoose.model('Image', imageSchema);
