import {
	EventPublisher,
	GameFactory,
} from "../types";
import {
	ANON_USERNAME,
	GAME_HOST,
	GAME_PERMISSIONS,
	GAME_READ,
} from "@rpgtools/common/src/permission-constants";
import bcrypt from "bcrypt";
import { SALT_ROUNDS } from "../resolvers/mutations/authentication-mutations";
import {USER} from "@rpgtools/common/src/type-constants";
import { SecurityContext } from "../security/security-context";
import {
	Character, CharacterAttribute,
	FogStroke,
	Game,
	InGameModel,
	Message,
	PathNode,
	Stroke,
} from "../domain-entities/game";
import {
	GAME_CHAT_EVENT,
	GAME_FOG_STROKE_ADDED,
	GAME_MAP_CHANGE,
	GAME_MODEL_ADDED,
	GAME_MODEL_DELETED,
	GAME_MODEL_POSITIONED,
	GAME_STROKE_EVENT,
	ROSTER_CHANGE_EVENT,
} from "../resolvers/subscription-resolvers";
import { v4 as uuidv4 } from "uuid";
import { WikiPageModel } from "../dal/mongodb/models/wiki-page";
import { HelpGameCommand } from "../domain-entities/game-commands/help-game-command";
import { RollGameCommand } from "../domain-entities/game-commands/roll-game-command";
import { WhisperGameCommand } from "../domain-entities/game-commands/whisper-game-command";
import { AbstractGameCommand } from "../domain-entities/game-commands/abstract-game-command";
import { User } from "../domain-entities/user";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import { FilterCondition } from "../dal/filter-condition";
import {AuthorizationService} from "./authorization-service";
import {DatabaseContext} from "../dal/database-context";

export const MESSAGE_ALL_RECEIVE = "all";
export const MESSAGE_SERVER_USER = "Server";

@injectable()
export class GameService {

	@inject(INJECTABLE_TYPES.AuthorizationService)
	authorizationService: AuthorizationService;

	@inject(INJECTABLE_TYPES.EventPublisher)
	eventPublisher: EventPublisher;

	@inject(INJECTABLE_TYPES.GameFactory)
	gameFactory: GameFactory;

	createGame = async (
		context: SecurityContext,
		worldId: string,
		password: string,
		characterName: string,
		databaseContext: DatabaseContext
	) => {
		const world = await databaseContext.worldRepository.findOneById(worldId);
		if (!world) {
			throw new Error(`World with id ${worldId} does not exist`);
		}
		if (!context.hasPermission(GAME_HOST, world)) {
			throw new Error("You do not have permission to host games on this world");
		}
		const game = this.gameFactory(
			{
				_id: null,
				passwordHash: password && bcrypt.hashSync(password, SALT_ROUNDS),
				world: worldId,
				map: null,
				characters: [
					new Character(
						null,
						characterName || context.user.username,
						context.user._id,
						this.genColor(),
						[]
					),
				],
				strokes: [],
				fog: [],
				messages: [],
				models: [],
				host: context.user._id,
				acl: []
			}
		);

		await databaseContext.gameRepository.create(game);
		for (let permission of GAME_PERMISSIONS) {
			game.acl.push({
				permission,
				principal: context.user._id,
				principalType: USER
			})
		}
		await databaseContext.userRepository.update(context.user);
		return game;
	};

	joinGame = async (
		context: SecurityContext,
		gameId: string,
		password: string,
		characterName: string,
		databaseContext: DatabaseContext
	) => {
		const game = await databaseContext.gameRepository.findOneById(gameId);
		if (!game) {
			throw new Error("Game does not exist");
		}
		if (game.passwordHash && !bcrypt.compareSync(password, game.passwordHash)) {
			throw new Error("Password is incorrect");
		}
		game.acl.push({
			permission: GAME_READ,
			principal: context.user._id,
			principalType: USER
		});
		await databaseContext.userRepository.update(context.user);
		game.characters.push(
			new Character(
				null,
				characterName || context.user.username,
				context.user._id,
				this.genColor(),
				[]
			)
		);
		await databaseContext.gameRepository.update(game);
		await this.eventPublisher.publish(ROSTER_CHANGE_EVENT, { gameRosterChange: game });
		return game;
	};
	leaveGame = async (context: SecurityContext, gameId: string, databaseContext: DatabaseContext) => {
		const game = await databaseContext.gameRepository.findOneById(gameId);
		if (!game) {
			throw new Error("Game does not exist");
		}
		if (!game.characters.find((character) => character.player === context.user._id)) {
			throw new Error("You are not in this game");
		}

		game.characters = game.characters.filter((character) => character.player !== context.user._id);
		await databaseContext.gameRepository.update(game);

		if (game.host === context.user._id) {
			await databaseContext.gameRepository.delete(game);
		} else {
			game.acl = game.acl.filter(entry => entry.principalType !== USER || entry.principal === context.user._id);
		}

		await this.eventPublisher.publish(ROSTER_CHANGE_EVENT, { gameRosterChange: game });
		return true;
	};
	gameChat = async (context: SecurityContext, gameId: string, message: string, databaseContext: DatabaseContext) => {
		const game = await databaseContext.gameRepository.findOneById(gameId);
		if (!game) {
			throw new Error("Game does not exist");
		}
		const character = game.characters.find((character) => character.player === context.user._id);
		if (!character) {
			throw new Error("You do not have permission to chat in this game");
		}
		const messages: Message[] = [];
		if (message.substr(0, 1) === "/") {
			const serverResponses = this.gameCommands(game, message, context.user);
			messages.push(...serverResponses);
		} else {
			const userMessage = new Message(character.name, character.player, MESSAGE_ALL_RECEIVE, MESSAGE_ALL_RECEIVE, message, Date.now(), uuidv4());
			messages.push(userMessage);
		}
		game.messages = game.messages.concat(messages);
		await databaseContext.gameRepository.update(game);

		for (let message of messages) {
			await this.eventPublisher.publish(GAME_CHAT_EVENT, { gameId, gameChat: message });
		}
		return game;
	};
	setGameMap = async (
		context: SecurityContext,
		gameId: string,
		placeId: string,
		clearPaint: boolean,
		setFog: boolean,
		databaseContext: DatabaseContext
	) => {
		const game = await databaseContext.gameRepository.findOneById(gameId);
		if (!game) {
			throw new Error("Game does not exist");
		}
		if (!(await game.authorizationPolicy.canWrite(context))) {
			throw new Error("You do not have permission to change the location for this game");
		}
		const place = await databaseContext.placeRepository.findOneById(placeId);
		if (!place) {
			throw new Error("Place does not exist");
		}
		if (!place.mapImage) {
			throw new Error("Cannot use a location in game that does not have a map image");
		}
		const newMap = await databaseContext.imageRepository.findOneById(place.mapImage);
		if (!place.pixelsPerFoot) {
			throw new Error("Place needs to have pixels per foot defined");
		}

		if (clearPaint && game.map && game.strokes.length > 0) {
			const oldPlace = await databaseContext.placeRepository.findOneById(game.map);
			const oldMap = await databaseContext.imageRepository.findOneById(oldPlace.mapImage);
			const oldMapSize = Math.max(oldMap.height, oldMap.width);

			game.strokes = [
				new Stroke(
					uuidv4(),
					[new PathNode(uuidv4(), 0, 0)],
					"#FFFFFF",
					Math.ceil(oldMapSize / oldPlace.pixelsPerFoot / 2),
					true,
					"erase"
				),
			];
		}

		if (setFog) {
			const newMaxSize = Math.max(newMap.height, newMap.width);

			game.fog = [
				new FogStroke(
					uuidv4(),
					[
						new PathNode(
							uuidv4(),
							Math.ceil(newMaxSize / place.pixelsPerFoot / 2),
							Math.ceil(newMaxSize / place.pixelsPerFoot / 2)
						),
					],
					newMaxSize,
					"fog"
				),
			];
		} else {
			game.fog = [];
		}

		game.map = place._id;

		await databaseContext.gameRepository.update(game);
		await this.eventPublisher.publish(GAME_MAP_CHANGE, { gameMapChange: game });
		return game;
	};
	addStroke = async (
		context: SecurityContext,
		gameId: string,
		path: PathNode[],
		type: string,
		size: number,
		color: string,
		fill: boolean,
		strokeId: string,
		databaseContext: DatabaseContext
	) => {
		const game = await databaseContext.gameRepository.findOneById(gameId);
		if (!game) {
			throw new Error("Game does not exist");
		}
		if (!(await game.authorizationPolicy.userCanPaint(context))) {
			throw new Error("You do not have permission to paint for this game");
		}
		const newStroke = new Stroke(strokeId, path, color, size, fill, type);
		game.strokes.push(newStroke);
		await databaseContext.gameRepository.update(game);
		await this.eventPublisher.publish(GAME_STROKE_EVENT, {
			gameId,
			gameStrokeAdded: newStroke,
		});
		return game;
	};
	addFogStroke = async (
		context: SecurityContext,
		gameId: string,
		path: PathNode[],
		type: string,
		size: number,
		strokeId: string,
		databaseContext: DatabaseContext
	) => {
		const game = await databaseContext.gameRepository.findOneById(gameId);
		if (!game) {
			throw new Error("Game does not exist");
		}
		if (!(await game.authorizationPolicy.userCanWriteFog(context))) {
			throw new Error("You do not have permission to edit fog for this game");
		}
		const newStroke = new FogStroke(strokeId, path, size, type);
		game.fog.push(newStroke);
		await databaseContext.gameRepository.update(game);
		await this.eventPublisher.publish(GAME_FOG_STROKE_ADDED, {
			gameId,
			gameFogStrokeAdded: newStroke,
		});
		return game;
	};
	addModel = async (
		context: SecurityContext,
		gameId: string,
		modelId: string,
		wikiId: string,
		color: string,
		databaseContext: DatabaseContext
	) => {
		const game = await databaseContext.gameRepository.findOneById(gameId);
		if (!game) {
			throw new Error("Game does not exist");
		}
		if (!(await game.authorizationPolicy.userCanModel(context))) {
			throw new Error("You do not have permission to change the location for this game");
		}
		const model = await databaseContext.modelRepository.findOneById(modelId);
		if (!model) {
			throw new Error("Model does not exist");
		}
		const wiki = await WikiPageModel.findById(wikiId);
		if (wikiId && !wiki) {
			throw new Error(`Cannot find wiki with ID ${wikiId}`);
		}
		const positionedModel = new InGameModel(uuidv4(), modelId, 0, 0, 0, 1, color, wikiId);
		game.models.push(positionedModel);
		await databaseContext.gameRepository.update(game);
		await this.eventPublisher.publish(GAME_MODEL_ADDED, {
			gameId,
			gameModelAdded: positionedModel,
		});
		return game;
	};
	setModelPosition = async (
		context: SecurityContext,
		gameId: string,
		positionedModelId: string,
		x: number,
		z: number,
		lookAtX: number,
		lookAtZ: number,
		databaseContext: DatabaseContext
	) => {
		const game = await databaseContext.gameRepository.findOneById(gameId);
		if (!game) {
			throw new Error("Game does not exist");
		}
		if (!(await game.authorizationPolicy.userCanModel(context))) {
			throw new Error("You do not have permission to change the location for this game");
		}
		let positionedModel: InGameModel = null;
		for (let model of game.models) {
			if (model._id === positionedModelId) {
				positionedModel = model;
			}
		}
		if (!positionedModel) {
			throw new Error(`Model with id ${positionedModelId} does not exist`);
		}
		positionedModel.x = x;
		positionedModel.z = z;
		positionedModel.lookAtX = lookAtX;
		positionedModel.lookAtZ = lookAtZ;
		await databaseContext.gameRepository.update(game);

		await this.eventPublisher.publish(GAME_MODEL_POSITIONED, {
			gameId,
			gameModelPositioned: positionedModel,
		});

		return positionedModel;
	};
	setModelColor = async (
		context: SecurityContext,
		gameId: string,
		positionedModelId: string,
		color: string,
		databaseContext: DatabaseContext
	) => {
		const game = await databaseContext.gameRepository.findOneById(gameId);
		if (!game) {
			throw new Error("Game does not exist");
		}
		if (!(await game.authorizationPolicy.userCanModel(context))) {
			throw new Error("You do not have permission to change the location for this game");
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
		await databaseContext.gameRepository.update(game);

		await this.eventPublisher.publish(GAME_MODEL_POSITIONED, {
			gameId,
			gameModelPositioned: positionedModel,
		});

		return positionedModel;
	};
	deletePositionedModel = async (
		context: SecurityContext,
		gameId: string,
		positionedModelId: string,
		databaseContext: DatabaseContext
	) => {
		const game = await databaseContext.gameRepository.findOneById(gameId);
		if (!game) {
			throw new Error("Game does not exist");
		}
		if (!(await game.authorizationPolicy.userCanModel(context))) {
			throw new Error("You do not have permission to change the location for this game");
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
		game.models = game.models.filter((model) => model._id !== positionedModelId);
		await databaseContext.gameRepository.update(game);
		await this.eventPublisher.publish(GAME_MODEL_DELETED, {
			gameId,
			gameModelDeleted: positionedModel,
		});
		return game;
	};
	setPositionedModelWiki = async (
		context: SecurityContext,
		gameId: string,
		positionedModelId: string,
		wikiId: string,
		databaseContext: DatabaseContext
	) => {
		const game = await databaseContext.gameRepository.findOneById(gameId);
		if (!game) {
			throw new Error("Game does not exist");
		}
		if (!(await game.authorizationPolicy.userCanModel(context))) {
			throw new Error("You do not have permission to change the location for this game");
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
		const wiki = await databaseContext.wikiPageRepository.findOneById(wikiId);
		if (!wiki) {
			throw new Error(`Cannot find wiki with ID ${wikiId}`);
		}
		positionedModel.wiki = wiki._id;
		await databaseContext.gameRepository.update(game);
		await this.eventPublisher.publish(GAME_MODEL_POSITIONED, {
			gameId,
			gameModelPositioned: positionedModel,
		});
		return positionedModel;
	};
	setCharacterOrder = async (context: SecurityContext, gameId: string, characters: Character[], databaseContext: DatabaseContext) => {
		const game = await databaseContext.gameRepository.findOneById(gameId);
		if (!game) {
			throw new Error("Game does not exist");
		}
		if (!(await game.authorizationPolicy.canWrite(context))) {
			throw new Error("You do not have permission to change the character order for this game.");
		}
		const newOrder = [];
		for (let newCharacter of characters) {
			for (let character of game.characters) {
				if (character.name === newCharacter.name) {
					newOrder.push(character);
					break;
				}
			}
		}
		game.characters = newOrder;
		await databaseContext.gameRepository.update(game);
		await this.eventPublisher.publish(ROSTER_CHANGE_EVENT, { gameRosterChange: game });
		return game;
	};
	setCharacterAttributes = async (
		context: SecurityContext,
		gameId: string,
		attributes: CharacterAttribute[],
		databaseContext: DatabaseContext
	): Promise<Game> => {
		const game = await databaseContext.gameRepository.findOneById(gameId);
		if (!game) {
			throw new Error("Game does not exist");
		}
		let userCharacter = null;
		for (let character of game.characters) {
			if (character.player === context.user._id) {
				userCharacter = character;
				break;
			}
		}
		if (!userCharacter) {
			throw new Error("You are not playing in this game");
		}
		userCharacter.attributes = attributes;

		await databaseContext.gameRepository.update(game);
		return game;
	};

	getGame = async (context: SecurityContext, gameId: string, databaseContext: DatabaseContext): Promise<Game> => {
		const foundGame = await databaseContext.gameRepository.findOneById(gameId);
		if (foundGame && !(await foundGame.authorizationPolicy.canRead(context))) {
			throw new Error("You do not have permission to read this game");
		}
		return foundGame;
	};

	getMyGames = async (context: SecurityContext, databaseContext: DatabaseContext): Promise<Game[]> => {
		if (context.user.username === ANON_USERNAME) {
			return [];
		}
		return databaseContext.gameRepository.findByPlayer(context.user._id);
	};

	private genColor = () => '#' + (Math.random()*0xFFFFFF<<0).toString(16);

	private gameCommands = (game: Game, message: string, currentUser: User): Message[] => {
		const commands: AbstractGameCommand[] = [];
		commands.push(
			new HelpGameCommand(commands),
			new RollGameCommand(),
			new WhisperGameCommand(game.characters)
		);
		const parts = message.split(" ");
		const commandString = parts.shift();
		const command = commands.find((command) => command.command === commandString);
		const executor = game.characters.find((character) => character.player === currentUser._id);
		let serverResponse = command.getDefaultResponse(executor);
		const messages: Message[] = [];
		if (command.echoCommand) {
			messages.push(new Message(executor.name, executor.player, MESSAGE_SERVER_USER, MESSAGE_SERVER_USER, message, Date.now(), uuidv4()));
		}
		if (!command) {
			serverResponse.message = `${command} is not a recognized server command. Try using /help for command usage help.`;
			messages.push(serverResponse);
			return messages;
		}
		const options = [];
		const args = [];
		for (let option of command.options) {
			const currentArg = parts.shift();
			if (currentArg) {
				if (currentArg === option.name) {
					options.push({ name: option.name });
				} else {
					parts.unshift(currentArg);
				}
			} else {
				// no more parts
				break;
			}
		}
		for (let arg of command.args) {
			const currentArg = parts.shift();
			if (currentArg) {
				if (currentArg.substr(0, 1) === "-") {
					serverResponse.message = `Unrecognized option: ${currentArg}\n${command.formatHelpMessage()}`;
					messages.push(serverResponse);
					return messages;
				}
				let value = currentArg;
				if (arg.multiple) {
					let nextArg = parts.shift();
					while (nextArg) {
						value += " " + nextArg;
						nextArg = parts.shift();
					}
				}
				args.push({
					name: arg.name,
					value: value,
				});
			} else if (!arg.optional) {
				serverResponse.message = `Required argument ${
					arg.name
				} not given.\n${command.formatHelpMessage()}`;
				messages.push(serverResponse);
				return messages;
			} else {
				// no more parts
				break;
			}
		}
		if (parts.length !== 0) {
			serverResponse.message = `Too many arguments given: ${parts.join(
				", "
			)}\n${command.formatHelpMessage()}`;
			messages.push(serverResponse);
			return messages;
		}
		messages.push(...command.exec(executor, args, options));
		return messages;
	};
}
