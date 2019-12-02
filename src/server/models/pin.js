import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const pinSchema = Schema({
	x: {
		type: Number,
		required: [true, 'x position required']
	},
	y: {
		type: Number,
		required: [true, 'y position required']
	},
	map: {
		type: mongoose.Schema.ObjectId,
		ref: 'Image',
		required: [true, 'map required']
	},
	page: {
		type: mongoose.Schema.ObjectId,
		ref: 'WikiPage'
	}
});

export const Pin = mongoose.model('Pin', pinSchema);
