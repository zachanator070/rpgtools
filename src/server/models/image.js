import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const imageSchema = Schema({
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
		ref: 'Chunk'
	}],
	icon: {
		type: mongoose.Schema.ObjectId,
		ref: 'Image'
	},
	name: String
});

export const Image = mongoose.model('Image', imageSchema);
