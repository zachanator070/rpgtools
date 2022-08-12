import mongoose from "mongoose";
import { GAME, MODEL, PLACE, WIKI_PAGE, WORLD } from "@rpgtools/common/src/type-constants";
import { GameDocument } from "../../../types";

const pathNode = new mongoose.Schema({
	x: Number,
	y: Number,
	_id: String,
});

const strokeSchema = new mongoose.Schema({
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

const fogStrokeSchema = new mongoose.Schema({
	path: [pathNode],
	size: Number,
	type: {
		type: String,
		enum: ["fog", "erase"],
	},
	_id: String,
});

const gameSchema = new mongoose.Schema({
	passwordHash: {
		type: String,
	},
	world: {
		type: mongoose.Schema.Types.ObjectId,
		ref: WORLD,
		required: [true, "worldId required"],
	},
	map: {
		type: mongoose.Schema.Types.ObjectId,
		ref: PLACE,
	},
	characters: [
		new mongoose.Schema({
			_id: {
				type: String,
				required: [true, "_id required"],
			},
			name: {
				type: String,
			},
			player: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				required: [true, "player id required"],
			},
			color: {
				type: String,
				required: [true, "color is required"],
			},
			attributes: [
				new mongoose.Schema({
					_id: {
						type: String,
						required: [true, "_id required"],
					},
					name: {
						type: String,
						required: [true, "name required"],
					},
					value: {
						type: Number,
						required: [true, "value required"],
					},
				})
			]
		}),
	],
	host: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: [true, "host id required"],
	},
	strokes: [strokeSchema],
	fog: [fogStrokeSchema],
	messages: [
		new mongoose.Schema({
			_id: {
				type: String,
				required: [true, "_id required"],
			},
			sender: {
				type: String,
				required: [true, "sender required"],
			},
			senderUser: {
				type: String,
				required: [true, "sender user required"],
			},
			receiver: {
				type: String,
				required: [true, "receiver required"],
			},
			receiverUser: {
				type: String,
				required: [true, "receiver user required"],
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
		new mongoose.Schema({
			_id: {
				type: String,
				required: [true, "_id required"],
			},
			model: {
				type: mongoose.Schema.Types.ObjectId,
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
				type: mongoose.Schema.Types.ObjectId,
				ref: WIKI_PAGE,
			},
		}),
	],
});

export const GameModel = mongoose.model<GameDocument>(GAME, gameSchema);
