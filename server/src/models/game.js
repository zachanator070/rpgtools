import mongoose from 'mongoose';
import {GAME, IMAGE, PLACE, WORLD} from "../../../common/src/type-constants";
import {GAME_WRITE, WIKI_READ, WIKI_READ_ALL, WIKI_RW, WIKI_RW_ALL} from "../../../common/src/permission-constants";

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
			required: [true, 'message required']
		},
		timestamp: {
			type: String,
			required: [true, 'timestamp required']
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

gameSchema.methods.userCanWrite = async function(user){
	return await user.hasPermission(GAME_WRITE, this._id);
};

gameSchema.methods.userCanRead = async function(user){
	return await this.userInGame(user);
};

export const Game = mongoose.model(GAME, gameSchema);
