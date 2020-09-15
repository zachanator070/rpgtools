import {GAME_ADMIN, GAME_HOST, GAME_RW} from "../../../../common/src/permission-constants";
import {Game} from "../../models/game";
import {Model} from '../../models/model';
import bcrypt from "bcrypt";
import {SALT_ROUNDS} from "./authentication-mutations";
import {PermissionAssignment} from "../../models/permission-assignement";
import {GAME} from "../../../../common/src/type-constants";
import {pubsub} from "../../gql-server";
import {
	GAME_CHAT_EVENT, GAME_FOG_STROKE_ADDED,
	GAME_MAP_CHANGE,
	GAME_MODEL_ADDED, GAME_MODEL_DELETED, GAME_MODEL_POSITIONED,
	GAME_STROKE_EVENT,
	ROSTER_CHANGE_EVENT
} from "../server-resolvers";
import {cleanUpPermissions} from "../../db-helpers";
import {Place} from "../../models/place";
import {v4 as uuidv4} from 'uuid';

const gameCommands = (message, currentUser) => {
	const parts = message.split(' ');
	const command = parts[0];
	const args = parts.slice(1);
	let serverResponse = `${command} is not a recognized command`;
	const commands = {
		'/help': () => {
			return 'Available server commands:\n' + Object.keys(commands).join('\n');
		},
		'/roll': () => {
			const help = 'Usage: /roll <number of dice>d<number of sides on dice>'
			let response = '';
			if(args[0]){
				const matches = args[0].match(/(?<numDice>\d+)d(?<dice>\d+)/);
				if(matches){
					const numDice = parseInt(matches.groups.numDice);
					const dice = parseInt(matches.groups.dice);
					response = `${currentUser.username} rolls ${args[0]} ...\n`;
					let total = 0;
					for(let i = 0; i<numDice;  i++){
						const result = Math.ceil(Math.random() * dice);
						total += result;
						response += `${result}\n`;
					}
					response += `Total: ${total}`;
				}
				else{
					response = help
				}
			}
			else {
				response = help
			}
			return response;
		}
	};
	if(Object.keys(commands).includes(command)){
		serverResponse = commands[command]();
	}
	return serverResponse;
};

export const gameMutations = {
	createGame: async (_, {worldId, password}, {currentUser}) => {
		if(!await currentUser.hasPermission(GAME_HOST, worldId)){
			throw new Error('You do not have permission to host games on this world');
		}
		const game = await Game.create({world: worldId, passwordHash: password && bcrypt.hashSync(password, SALT_ROUNDS), players: [currentUser], host: currentUser});
		for(let permission of [GAME_RW, GAME_ADMIN]){
			const permissionAssignment = await PermissionAssignment.create({permission: permission, subject: game._id, subjectType: GAME});
			currentUser.permissions.push(permissionAssignment);
		}
		await game.save();
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
		await pubsub.publish(ROSTER_CHANGE_EVENT, {gameRosterChange: game});
		return game;
	},
	leaveGame: async (_, {gameId}, {currentUser}) => {
		const game = await Game.findById(gameId);
		if(!game){
			throw new Error('Game does not exist');
		}
		if(!await game.userInGame(currentUser)){
			throw new Error('You are not in this game');
		}
		game.players = game.players.filter((userId => ! userId.equals(currentUser._id)));
		if(game.host.equals(currentUser._id)){
			await Game.deleteOne({_id: gameId});
			await cleanUpPermissions(game._id);
		}
		else{
			await game.save();
		}

		await pubsub.publish(ROSTER_CHANGE_EVENT, {gameRosterChange: game});
		return true;
	},
	gameChat: async (_, {gameId, message}, {currentUser}) => {
		const game = await Game.findById(gameId);
		if(!game){
			throw new Error('Game does not exist');
		}
		if(!await game.userInGame(currentUser)){
			throw new Error('You do not have permission to chat in this game');
		}
		let serverResponse = '';
		if(message.substr(0,1) === '/'){
			serverResponse = gameCommands(message, currentUser);
		}
		const userMessage = {sender: currentUser.username, message, timestamp: Date.now()};
		game.messages.push(userMessage);
		await pubsub.publish(GAME_CHAT_EVENT, {gameId, gameChat: userMessage});
		if(serverResponse){
			const serverMessage = {sender: 'Server', message: serverResponse, timestamp: Date.now()}
			game.messages.push(serverMessage);
			await pubsub.publish(GAME_CHAT_EVENT, {gameId, gameChat: serverMessage});
		}

		await game.save();

		return game;
	},
	setGameMap: async (_, {gameId, placeId, clearPaint, setFog}, {currentUser}) => {
		const game = await Game.findById(gameId).populate({
			path: 'map',
			populate: {
				path: 'mapImage'
			}
		});
		if(!game){
			throw new Error('Game does not exist');
		}
		if(!await game.userCanWrite(currentUser)){
			throw new Error('You do not have permission to change the location for this game');
		}
		const place = await Place.findById(placeId).populate('mapImage');
		if(!place){
			throw new Error('Place does not exist');
		}
		if(!place.mapImage){
			throw new Error('Cannot use a location in game that does not have a map image');
		}
		if(!place.pixelsPerFoot){
			throw new Error('Place needs to have pixels per foot defined');
		}

		if(clearPaint && game.map  && game.strokes > 0){

			game.strokes = [{
				path: [{
					x: 0,
					y: 0
				}],
				color: '#FFFFFF',
				size: Math.max(game.map.mapImage.height, game.map.mapImage.width) / game.map.pixelsPerFoot,
				fill: true,
				type: 'erase',
				_id: uuidv4()
			}];
		}

		if(setFog){

			const newMaxSize = Math.max(place.mapImage.height, place.mapImage.width);

			game.fog = [{
				path: [{
					x: Math.ceil((newMaxSize/ place.pixelsPerFoot) / 2),
					y: Math.ceil((newMaxSize/ place.pixelsPerFoot) / 2)
				}],
				size: newMaxSize,
				type: 'fog',
				_id: uuidv4()
			}];
		}

		game.map = place;

		await game.save();
		await pubsub.publish(GAME_MAP_CHANGE, {gameMapChange: game});
		return game;
	},
	addStroke: async (_, {gameId, path, type, size, color, fill, strokeId}, {currentUser}) => {
		const game = await Game.findById(gameId);
		if(!game){
			throw new Error('Game does not exist');
		}
		if(!await game.userCanWrite(currentUser)){
			throw new Error('You do not have permission to paint for this game');
		}
		const newStroke = {
			path,
			color,
			size,
			fill,
			type,
			_id: strokeId
		};
		game.strokes.push(newStroke);
		await game.save();
		await pubsub.publish(GAME_STROKE_EVENT, {gameId, gameStrokeAdded: newStroke});
		return game;
	},
	addFogStroke: async (_, {gameId, path, type, size, strokeId}, {currentUser}) => {
		const game = await Game.findById(gameId);
		if(!game){
			throw new Error('Game does not exist');
		}
		if(!await game.userCanWriteFog(currentUser)){
			throw new Error('You do not have permission to edit fog for this game');
		}
		const newStroke = {
			path,
			size,
			type,
			_id: strokeId
		};
		game.fog.push(newStroke);
		await game.save();
		await pubsub.publish(GAME_FOG_STROKE_ADDED, {gameId, gameFogStrokeAdded: newStroke});
		return game;
	},
	addModel: async (_, {gameId, modelId}, {currentUser}) => {
		const game = await Game.findById(gameId);
		if(!game){
			throw new Error('Game does not exist');
		}
		if(!await game.userCanWrite(currentUser)){
			throw new Error('You do not have permission to change the location for this game');
		}
		const model = await Model.findById(modelId);
		if(!model){
			throw new Error('Model does not exist');
		}
		const positionedModel = {
			_id: uuidv4(),
			model: model,
			x: 0,
			z: 0,
			rotation: 0
		}
		game.models.push(positionedModel);
		await game.save();
		await pubsub.publish(GAME_MODEL_ADDED, {gameId, gameModelAdded: positionedModel});
		return game;
	},
	setModelPosition: async (_, {gameId, positionedModelId, x, z, rotation}, {currentUser}) => {
		const game = await Game.findById(gameId);
		if(!game){
			throw new Error('Game does not exist');
		}
		if(!await game.userCanWrite(currentUser)){
			throw new Error('You do not have permission to change the location for this game');
		}
		let positionedModel = null;
		for(let model of game.models){
			if(model._id === positionedModelId){
				positionedModel = model;
			}
		}
		if(!positionedModel){
			throw new Error(`Model with id ${positionedModelId} does not exist`);
		}
		positionedModel.x = x;
		positionedModel.z = z;
		positionedModel.rotation = rotation;
		await game.save();

		const model = positionedModel.toObject();
		model.model = await Model.findById(model.model);

		await pubsub.publish(GAME_MODEL_POSITIONED, {gameId, gameModelPositioned: model});

		return model;
	},
	deletePositionedModel: async (_, {gameId, positionedModelId}, {currentUser}) => {
		const game = await Game.findById(gameId);
		if(!game){
			throw new Error('Game does not exist');
		}
		if(!await game.userCanWrite(currentUser)){
			throw new Error('You do not have permission to change the location for this game');
		}
		let positionedModel = null;
		for(let model of game.models){
			if(model._id === positionedModelId){
				positionedModel = model;
			}
		}
		if(!positionedModel){
			throw new Error(`Model with id ${positionedModelId} does not exist`);
		}
		game.models = game.models.filter((model) => model._id !== positionedModelId);
		await game.save();
		await pubsub.publish(GAME_MODEL_DELETED, {gameId, gameModelDeleted: positionedModel});
		return game;
	}
};