import mongoose from 'mongoose';
import {GAME, IMAGE, PLACE, WORLD} from "../../../common/src/type-constants";
import {
	GAME_ADMIN, GAME_ADMIN_ALL,
	GAME_RW,
	ROLE_ADMIN, ROLE_ADMIN_ALL,
	WIKI_READ,
	WIKI_READ_ALL,
	WIKI_RW,
	WIKI_RW_ALL
} from "../../../common/src/permission-constants";

const Schema = mongoose.Schema;

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
	strokes: [new Schema({
		path: [new Schema({
			x: Number,
			y: Number,
			_id: String
		})],
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
	})],
	messages: [new Schema({
		sender: {
			type: String,
			required: [true, 'sender required']
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
	return await this.userInGame(user);
};

export const Game = mongoose.model(GAME, gameSchema);
