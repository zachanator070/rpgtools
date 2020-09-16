import mongoose from 'mongoose';
import {GAME, IMAGE, PLACE, WORLD} from "../../../common/src/type-constants";
import {
	GAME_ADMIN, GAME_ADMIN_ALL, GAME_FOG_WRITE, GAME_MODEL, GAME_PAINT, GAME_READ, GAME_RW,
} from "../../../common/src/permission-constants";

const Schema = mongoose.Schema;


const pathNode = new Schema({
	x: Number,
	y: Number,
	_id: String
});

const strokeSchema = new Schema(
	{
		path: [pathNode],
		color: {
			type: String
		},
		size: Number,
		fill: Boolean,
		type: {
			type: String,
			enum: ['circle', 'square', 'erase', 'line']
		},
		_id: String
	}
);

const fogStrokeSchema = new  Schema({
	path: [pathNode],
	size: Number,
	type: {
		type: String,
		enum: ['fog', 'erase']
	},
	_id: String
});

const gameSchema = new Schema({
	passwordHash: {
		type: String
	},
	world: {
		type: mongoose.Schema.ObjectId,
		ref: WORLD,
		required: [true, 'worldId required']
	},
	map: {
		type: mongoose.Schema.ObjectId,
		ref: PLACE,
	},
	players: [{
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: [true, 'player id required']
		}
	],
	host: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: [true, 'host id required']
	},
	strokes: [strokeSchema],
	fog: [fogStrokeSchema],
	messages: [new Schema({
		sender: {
			type: String,
			required: [true, 'sender required']
		},
		receiver: {
			type: String,
			required: [true, 'receiver required']
		},
		message: {
			type: String,
			required: [true, 'message required']
		},
		timestamp: {
			type: String,
			required: [true, 'timestamp required']
		}
	})],
	models: [new Schema({
		_id: {
			type: String,
			required: [true, '_id required']
		},
		model: {
			type: mongoose.Schema.ObjectId,
			ref: 'model',
			required: [true,  'model required']
		},
		x: {
			type: Number,
			required: [true, 'x position required']
		},
		z: {
			type: Number,
			required: [true, 'z position required']
		},
		rotation: {
			type: Number,
			required: [true, 'rotation required']
		}
	})]
});

gameSchema.methods.userInGame = async function(user) {
	for(let player of this.players){
		if(player instanceof mongoose.Types.ObjectId){
			if(user._id.equals(player)){
				return true;
			}
		}
		else if(player._id.equals(user._id)){
			return true;
		}
	}
	return false;
}

gameSchema.methods.userCanAdmin = async function(user) {
	return await user.hasPermission(GAME_ADMIN, this._id) || await user.hasPermission(GAME_ADMIN_ALL, this.world);
};

gameSchema.methods.userCanWrite = async function(user){
	return await user.hasPermission(GAME_RW, this._id);
};

gameSchema.methods.userCanRead = async function(user){
	return await user.hasPermission(GAME_READ, this._id) || await user.hasPermission(GAME_RW, this._id);
};

gameSchema.methods.userCanPaint = async function(user){
	return await user.hasPermission(GAME_PAINT, this._id);
};

gameSchema.methods.userCanModel = async function(user){
	return await user.hasPermission(GAME_MODEL, this._id);
};

gameSchema.methods.userCanWriteFog = async function(user){
	return await user.hasPermission(GAME_FOG_WRITE, this._id);
};

export const Game = mongoose.model(GAME, gameSchema);
