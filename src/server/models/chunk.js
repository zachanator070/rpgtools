
import mongoose from 'mongoose';

const chunkSchema = Schema({
	image: {
		type: mongoose.Schema.ObjectId,
		ref: 'Image',
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
	},
	data: {
		type: Buffer
	}
});

const Chunk = mongoose.model('Chunk', chunkSchema);

export default Chunk;
