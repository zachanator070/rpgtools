import mongoose from 'mongoose';
import {GAME, IMAGE, WORLD} from "../../type-constants";

const Schema = mongoose.Schema;

const gameSchema = new Schema({
	password_hash: {
		type: String
	},
	world: {
		type: mongoose.Schema.ObjectId,
		ref: WORLD,
		required: [true, 'worldId required']
	},
	mapImage: {
		type: mongoose.Schema.ObjectId,
		ref: IMAGE,
	},
	players: [new Schema({
		socketId: {
			type: String,
			required: [true, 'socketId required']
		},
		player: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: [true, 'player id required']
		}
	})],
	icons: [new Schema({
		image: {
			type: mongoose.Schema.ObjectId,
			ref: IMAGE,
			required: [true, 'icon image id required']
		},
		x: {
			type: Number,
			required: [true, 'x position required']
		},
		y: {
			type: Number,
			required: [true, 'y position required']
		}
	})],
	strokes: [new Schema({
		path: [new Schema({
			x: Number,
			y: Number,
		})],
		color: new Schema({
			r: Number,
			g: Number,
			b: Number,
			a: Number
		}),
		size: Number,
		filled: Boolean,
		type: {
			type: String,
			enum: ['circle', 'square', 'erase']
		}
	})],
	messages: [new Schema({
		sender: {
			type: String,
			required: [true, 'sender required']
		},
		message: {
			type: String,
			required: [true, 'icon image id required']
		},
		timeStamp: {
			type: String,
			required: [true, 'icon image id required']
		}
	})]
});

export const Game = mongoose.model(GAME, gameSchema);
