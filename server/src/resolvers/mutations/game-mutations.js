import {GAME_HOST, GAME_WRITE} from "../../../../common/src/permission-constants";
import {Game} from "../../models/game";
import bcrypt from "bcrypt";
import {SALT_ROUNDS} from "./authentication-mutations";
import {PermissionAssignment} from "../../models/permission-assignement";
import {GAME} from "../../../../common/src/type-constants";
import {pubsub} from "../../gql-server";
import {GAME_CHAT_EVENT, PLAYER_JOINED_EVENT} from "../server-resolvers";

export const gameMutations = {
	createGame: async (_, {worldId, password}, {currentUser}) => {
		if(!await currentUser.hasPermission(GAME_HOST, worldId)){
			throw new Error('You do not have permission to host games on this world');
		}
		const game = await Game.create({world: worldId, passwordHash: bcrypt.hashSync(password, SALT_ROUNDS), players: [currentUser]});
		const permission = await PermissionAssignment.create({permission: GAME_WRITE, subject: game._id, subjectType: GAME});
		currentUser.permissions.push(permission);
		await currentUser.save();
		return game;
	},
	joinGame: async (_, {gameId, password}, {currentUser}) => {
		const game = await Game.findById(gameId);
		if(!game){
			throw new Error('Game does not exist');
		}
		if(game.passwordHash && !bcrypt.compareSync(password, game.passwordHash)){
			throw new Error('Password is incorrect');
		}
		game.players.push(currentUser);
		await game.save();
		await pubsub.publish(PLAYER_JOINED_EVENT, {playerJoined: game});
		return game;
	},
	gameChat: async (_, {gameId, message}, {currentUser}) => {
		const game = await Game.findById(gameId);
		if(!game){
			throw new Error('Game does not exist');
		}
		if(!await game.userInGame(currentUser)){
			throw new Error('You do not have permission to chat in this game');
		}
		if(message.substr(0,1) === '/'){
			const parts = message.split(' ');
			const command = parts[0];
			const args = parts.slice(1);
			let serverResponse = `${command} is not a recognized command`;
			if(command === '/roll'){
				const help = 'Usage: /roll <number of dice>d<number of sides on dice>'
				if(args[0]){
					if(RegExp('\d*d\d*')){

					}
				}
				else {
					serverResponse = ''
				}
			}
		}
		game.messages.push({sender: currentUser.username, message, timestamp: Date.now()});
		await game.save();
		await pubsub.publish(GAME_CHAT_EVENT, {gameChat: game});
		return game;
	}
};