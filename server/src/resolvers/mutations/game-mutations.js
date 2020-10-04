import {
	GAME_ADMIN, GAME_FOG_WRITE,
	GAME_HOST, GAME_MODEL,
	GAME_PAINT,
	GAME_PERMISSIONS,
	GAME_READ,
} from "../../../../common/src/permission-constants";
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
import {WikiPage} from "../../models/wiki-page";

const gameCommands = (game, message, currentUser) => {

	const getDefaultResponse = () => {
		return {
			sender: 'Server',
			message: `Server error: no response message given!`,
			receiver: currentUser.username,
			timestamp: Date.now()
		};
	}
	const formatHelpMessage = (helpCommand) => {
		let usage = `${helpCommand.command}`;
		if(helpCommand.options.length > 0){
			usage += ' [OPTION]...';
		}
		for(let arg of helpCommand.args){
			if(!arg.optional){
				usage += ` ${arg.name}`;
			}
			else{
				usage += ` [${arg.name}]`;
			}
		}
		let message = `${helpCommand.command}\n Usage: ${usage} \n Description: ${helpCommand.description}`;
		if(helpCommand.args.length > 0){
			message += '\nArguments:';
		}
		for(let arg of helpCommand.args){
			message += `\n${arg.name} - ${arg.description}`;
		}
		if(helpCommand.options.length > 0){
			message += '\nOptions:';
		}
		for(let option of helpCommand.options){
			message += `\n${option.name} ${option.args.map(arg => arg.name).join(' ')} - ${option.description}`;
			if(option.args.length > 0){
				message += `\n\tOption Args:`;
				for(let arg of option.args){
					message += `\n\t${arg.name} - ${arg.description}`;
				}
			}
		}
		return message;
	};
	const getCommand = (commandToGet) => {
		for(let commandA of commands){
			if(commandA.command === commandToGet){
				return commandA;
			}
		}
	};
	const commands = [
		{
			command: '/help',
			description: 'Displays help message for a command, displays all if none specified',
			echoCommand: true,
			args: [{
				name: 'COMMAND',
				description: 'Only display the help for this command. Includes the / in the command.',
				optional: true
			}],
			options: [{
				name: '-g',
				args: [],
				description: 'Broadcast help to all users'
			}],
			exec: (args, options) => {
				const response = getDefaultResponse();
				if(args.length > 0){
					const helpCommand = commands.find(command => command.command === args[0].value);
					if(helpCommand){
						response.message = formatHelpMessage(helpCommand);
					}
				}
				else {
					response.message = 'Available server commands:\n\n' + commands.map(command => formatHelpMessage(command)).join('\n\n');
				}
				if(options.length > 0){
					response.receiver = 'all';
				}
				return [response];
			}
		},
		{
			command: '/roll',
			echoCommand: true,
			description: 'Rolls dice for you. Displays results to all players.',
			args: [{
				name: 'DICE',
				description: 'The dice that you wish to roll. Formatted <NUM>d<SIDES> where <NUM> is the number of dice to roll and <SIDES> is the number of sides on each dice'
			}],
			options: [{
				name: '-q',
				description: 'Roll quietly; do not broadcast results to all players',
				args: []
			}],
			exec: function(args, options){

				let response = getDefaultResponse();
				const matches = args.find(arg => arg.name === 'DICE').value.match(/(?<numDice>\d+)d(?<dice>\d+)/);
				if (matches) {
					const numDice = parseInt(matches.groups.numDice);
					const dice = parseInt(matches.groups.dice);
					const roller = options.find(option => option.name === '-q') ? 'You' : currentUser.username;
					response.message = `${roller} roll${roller === 'You' ? '' : 's'} ${args[0].value} ...\n`;
					let total = 0;
					for (let i = 0; i < numDice; i++) {
						const result = Math.ceil(Math.random() * dice);
						total += result;
						response.message += `${result}\n`;
					}
					response.message += `Total: ${total}`;
				} else {
					response.message = formatHelpMessage(this);
				}
				if(!options.find(option => option.name === '-q')){
					response.receiver = 'all';
				}
				return [response];
			}
		},
		{
			command: '/w',
			description: 'Whisper private message to another player',
			echoCommand: false,
			args: [
				{
					name: 'RECEIVER',
					description: 'The player to privately receive the message'
				},
				{
					name: 'MESSAGE',
					description: 'The message to send',
					multiple: true
				}
			],
			options: [],
			exec: (args, options) => {
				const receiver = args.find(arg => arg.name === 'RECEIVER').value;
				const message = args.find(arg => arg.name === 'MESSAGE').value;
				const response = getDefaultResponse();
				let foundPlayer = false;
				for(let player of game.players){
					if(player.username === receiver){
						foundPlayer = true;
						break;
					}
				}
				if(!foundPlayer){
					response.message = `Player ${receiver} not in game!`;
					return [response];
				}
				response.sender = currentUser.username;
				response.receiver = receiver;
				response.message = message;
				return [response];
			}
		}
	];
	const parts = message.split(' ');
	const commandString = parts.shift();
	const command = commands.find(command => command.command === commandString);
	let serverResponse = getDefaultResponse();
	const messages = [];
	if(command.echoCommand){
		messages.push({
			sender: currentUser.username,
			receiver: 'Server',
			message,
			timestamp: Date.now()
		});
	}
	if(!command){
		serverResponse.message = `${command} is not a recognized server command. Try using /help for command usage help.`
		messages.push(serverResponse);
		return messages;
	}
	const options = [];
	const args = [];
	for(let option of command.options){
		const currentArg = parts.shift();
		if(currentArg) {
			if (currentArg === option.name) {
				options.push({name: option.name});
			} else {
				parts.unshift(currentArg);
			}
		}
		else {
			// no more parts
			break;
		}
	}
	for(let arg of command.args){
		const currentArg = parts.shift();
		if(currentArg) {
			if(currentArg.substr(0,1) === '-'){
				serverResponse.message = `Unrecognized option: ${currentArg}\n${formatHelpMessage(command)}`
				messages.push(serverResponse);
				return messages;
			}
			let value = currentArg;
			if(arg.multiple){
				let nextArg = parts.shift();
				while(nextArg){
					value += ' ' + nextArg;
					nextArg = parts.shift();
				}
			}
			args.push({
				name: arg.name,
				value: value
			});
		}
		else if(!arg.optional){
			serverResponse.message = `Required argument ${arg.name} not given.\n${formatHelpMessage(command)}`;
			messages.push(serverResponse);
			return messages;
		}
		else{
			// no more parts
			break;
		}
	}
	if(parts.length !== 0){
		serverResponse.message = `Too many arguments given: ${parts.join(', ')}\n${formatHelpMessage(command)}`;
		messages.push(serverResponse);
		return messages;
	}
	messages.push(...command.exec(args, options));
	return messages;
};

export const gameMutations = {
	createGame: async (_, {worldId, password}, {currentUser}) => {
		if(!await currentUser.hasPermission(GAME_HOST, worldId)){
			throw new Error('You do not have permission to host games on this world');
		}
		const game = await Game.create({world: worldId, passwordHash: password && bcrypt.hashSync(password, SALT_ROUNDS), players: [currentUser], host: currentUser});
		for(let permission of GAME_PERMISSIONS){
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
		await currentUser.grantPermission(GAME_READ, gameId, GAME);
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
		await game.save();

		if(game.host.equals(currentUser._id)){
			await Game.deleteOne({_id: gameId});
			await cleanUpPermissions(game._id);
		}
		else{
			for(let permission of GAME_PERMISSIONS){
				await currentUser.revokePermission(permission, game._id);
			}
		}

		await pubsub.publish(ROSTER_CHANGE_EVENT, {gameRosterChange: game});
		return true;
	},
	gameChat: async (_, {gameId, message}, {currentUser}) => {
		const game = await Game.findById(gameId).populate('players');
		if(!game){
			throw new Error('Game does not exist');
		}
		if(!await game.userInGame(currentUser)){
			throw new Error('You do not have permission to chat in this game');
		}
		const messages = [];
		if(message.substr(0,1) === '/'){
			const serverResponses = gameCommands(game, message, currentUser);
			messages.push(...serverResponses);
		}
		else{
			const userMessage = {sender: currentUser.username, message, receiver: 'all', timestamp: Date.now()};
			messages.push(userMessage)
		}
		game.messages = game.messages.concat(messages);
		await game.save();

		for(let message of messages){
			await pubsub.publish(GAME_CHAT_EVENT, {gameId, gameChat: message});
		}

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

		if(clearPaint && game.map  && game.strokes.length > 0){

			const oldMapSize = Math.max(game.map.mapImage.height, game.map.mapImage.width);

			game.strokes = [{
				path: [{
					x: 0,
					y: 0
				}],
				color: '#FFFFFF',
				size: Math.ceil(oldMapSize / game.map.pixelsPerFoot / 2),
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
		else {
			game.fog = [];
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
		if(!await game.userCanPaint(currentUser)){
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
	addModel: async (_, {gameId, modelId, wikiId}, {currentUser}) => {
		const game = await Game.findById(gameId);
		if(!game){
			throw new Error('Game does not exist');
		}
		if(!await game.userCanModel(currentUser)){
			throw new Error('You do not have permission to change the location for this game');
		}
		const model = await Model.findById(modelId);
		if(!model){
			throw new Error('Model does not exist');
		}
		const wiki = await WikiPage.findById(wikiId);
		if(wikiId && !wiki){
			throw new Error(`Cannot find wiki with ID ${wikiId}`);
		}
		const positionedModel = {
			_id: uuidv4(),
			model: model,
			x: 0,
			z: 0,
			lookAtX: 0,
			lookAtZ: 1,
			wiki
		}
		game.models.push(positionedModel);
		await game.save();
		await pubsub.publish(GAME_MODEL_ADDED, {gameId, gameModelAdded: positionedModel});
		return game;
	},
	setModelPosition: async (_, {gameId, positionedModelId, x, z, lookAtX, lookAtZ}, {currentUser}) => {
		const game = await Game.findById(gameId);
		if(!game){
			throw new Error('Game does not exist');
		}
		if(!await game.userCanModel(currentUser)){
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
		positionedModel.lookAtX = lookAtX;
		positionedModel.lookAtZ = lookAtZ;
		await game.save();

		const model = positionedModel.toObject();
		model.model = await Model.findById(model.model);
		model.wiki = await WikiPage.findById(model.wiki);

		await pubsub.publish(GAME_MODEL_POSITIONED, {gameId, gameModelPositioned: model});

		return model;
	},
	setModelColor: async (_, {gameId, positionedModelId, color}, {currentUser}) => {
		const game = await Game.findById(gameId);
		if (!game) {
			throw new Error('Game does not exist');
		}
		if (!await game.userCanModel(currentUser)) {
			throw new Error('You do not have permission to change the location for this game');
		}
		let positionedModel = null;
		for (let model of game.models) {
			if (model._id === positionedModelId) {
				positionedModel = model;
			}
		}
		if (!positionedModel) {
			throw new Error(`Model with id ${positionedModelId} does not exist`);
		}
		positionedModel.color = color;
		await game.save();

		const model = positionedModel.toObject();
		model.model = await Model.findById(model.model);
		model.wiki = await WikiPage.findById(model.wiki);

		await pubsub.publish(GAME_MODEL_POSITIONED, {gameId, gameModelPositioned: model});

		return model;

	},
	deletePositionedModel: async (_, {gameId, positionedModelId}, {currentUser}) => {
		const game = await Game.findById(gameId);
		if(!game){
			throw new Error('Game does not exist');
		}
		if(!await game.userCanModel(currentUser)){
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
	},
	setPositionedModelWiki: async (_, {gameId, positionedModelId, wikiId}, {currentUser}) => {
		const game = await Game.findById(gameId);
		if (!game) {
			throw new Error('Game does not exist');
		}
		if (!await game.userCanModel(currentUser)) {
			throw new Error('You do not have permission to change the location for this game');
		}
		let positionedModel = null;
		for (let model of game.models) {
			if (model._id === positionedModelId) {
				positionedModel = model;
			}
		}
		if (!positionedModel) {
			throw new Error(`Model with id ${positionedModelId} does not exist`);
		}
		const wiki = await WikiPage.findById(wikiId);
		if (wikiId && !wiki) {
			throw new Error(`Cannot find wiki with ID ${wikiId}`);
		}
		positionedModel.wiki = wiki;
		await game.save();
		const model = positionedModel.toObject();
		model.model = await Model.findById(model.model);
		model.wiki = await WikiPage.findById(model.wiki);
		await pubsub.publish(GAME_MODEL_POSITIONED, {gameId, gameModelPositioned: model});
		return model;
	}
};