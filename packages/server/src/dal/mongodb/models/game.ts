import mongoose, { Schema } from "mongoose";
import { GAME, MODEL, PLACE, WIKI_PAGE, WORLD } from "../../../../../common/src/type-constants";
import {GameDocument} from "../../../types";

const pathNode = new Schema({
	x: Number,
	y: Number,
	_id: String,
});

const strokeSchema = new Schema({
	path: [pathNode],
	color: {
		type: String,
	},
	size: Number,
	fill: Boolean,
	type: {
		type: String,
		enum: ["circle", "square", "erase", "line"],
	},
	_id: String,
});

const fogStrokeSchema = new Schema({
	path: [pathNode],
	size: Number,
	type: {
		type: String,
		enum: ["fog", "erase"],
	},
	_id: String,
});

const gameSchema = new Schema({
	passwordHash: {
		type: String,
	},
	world: {
		type: Schema.Types.ObjectId,
		ref: WORLD,
		required: [true, "worldId required"],
	},
	map: {
		type: Schema.Types.ObjectId,
		ref: PLACE,
	},
	characters: [
		new Schema({
			name: {
				type: String,
			},
			player: {
				type: Schema.Types.ObjectId,
				ref: "User",
				required: [true, "player id required"],
			},
			color: {
				type: String,
				required: [true, "color is required"],
			},
			str: {
				type: Number,
				default: 0,
			},
			dex: {
				type: Number,
				default: 0,
			},
			con: {
				type: Number,
				default: 0,
			},
			int: {
				type: Number,
				default: 0,
			},
			wis: {
				type: Number,
				default: 0,
			},
			cha: {
				type: Number,
				default: 0,
			},
		}),
	],
	host: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: [true, "host id required"],
	},
	strokes: [strokeSchema],
	fog: [fogStrokeSchema],
	messages: [
		new Schema({
			_id: {
				type: String,
				required: [true, "_id required"],
			},
			sender: {
				type: String,
				required: [true, "sender required"],
			},
			receiver: {
				type: String,
				required: [true, "receiver required"],
			},
			message: {
				type: String,
				required: [true, "message required"],
			},
			timestamp: {
				type: String,
				required: [true, "timestamp required"],
			},
		}),
	],
	models: [
		new Schema({
			_id: {
				type: String,
				required: [true, "_id required"],
			},
			model: {
				type: Schema.Types.ObjectId,
				ref: MODEL,
				required: [true, "model required"],
			},
			x: {
				type: Number,
				required: [true, "x position required"],
			},
			z: {
				type: Number,
				required: [true, "z position required"],
			},
			lookAtX: {
				type: Number,
				required: [true, "x look at point required"],
			},
			lookAtZ: {
				type: Number,
				required: [true, "z look at point required"],
			},
			color: {
				type: String,
			},
			wiki: {
				type: Schema.Types.ObjectId,
				ref: WIKI_PAGE,
			},
		}),
	],
});

export const GameModel = mongoose.model<GameDocument>(GAME, gameSchema);
