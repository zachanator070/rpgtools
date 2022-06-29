import {
	AuthorizationService,
	EventPublisher,
	Factory,
	GameFactory,
	GameRepository,
	GameService,
	PermissionAssignmentFactory,
} from "../types";
import {
	ANON_USERNAME,
	GAME_HOST,
	GAME_PERMISSIONS,
	GAME_READ,
} from "@rpgtools/common/src/permission-constants";
import bcrypt from "bcrypt";
import { SALT_ROUNDS } from "../resolvers/mutations/authentication-mutations";
import { GAME } from "@rpgtools/common/src/type-constants";
import { SecurityContext } from "../security/security-context";
import { DbUnitOfWork } from "../dal/db-unit-of-work";
import {
	Character,
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
import { GameAuthorizationRuleset } from "../security/ruleset/game-authorization-ruleset";

@injectable()
export class GameApplicationService implements GameService {
	@inject(INJECTABLE_TYPES.GameRepository)
	gameRepository: GameRepository;

	@inject(INJECTABLE_TYPES.AuthorizationService)
	authorizationService: AuthorizationService;

	@inject(INJECTABLE_TYPES.EventPublisher)
	eventPublisher: EventPublisher;

	@inject(INJECTABLE_TYPES.GameAuthorizationRuleset)
	gameAuthorizationRuleSet: GameAuthorizationRuleset;

	@inject(INJECTABLE_TYPES.DbUnitOfWorkFactory)
	dbUnitOfWorkFactory: Factory<DbUnitOfWork>;

	@inject(INJECTABLE_TYPES.GameFactory)
	gameFactory: GameFactory;
	@inject(INJECTABLE_TYPES.PermissionAssignmentFactory)
	permissionAssignmentFactory: PermissionAssignmentFactory;

	createGame = async (
		context: SecurityContext,
		worldId: string,
		password: string,
		characterName: string
	) => {
		if (!(await context.hasPermission(GAME_HOST, worldId))) {
			throw new Error("You do not have permission to host games on this world");
		}
		const unitOfWork = this.dbUnitOfWorkFactory();
		const game = this.gameFactory(
			null,
			password && bcrypt.hashSync(password, SALT_ROUNDS),
			worldId,
			null,
			[
				new Character(
					"",
					characterName || context.user.username,
					context.user._id,
					this.genColor(),
					0,
					0,
					0,
					0,
					0,
					0
				),
			],
			[],
			[],
			[],
			[],
			context.user._id
		);

		for (let permission of GAME_PERMISSIONS) {
			const permissionAssignment = this.permissionAssignmentFactory(
				null,
				permission,
				game._id,
				GAME
			);
			await unitOfWork.permissionAssignmentRepository.create(permissionAssignment);
			context.user.permissions.push(permissionAssignment._id);
			context.permissions.push(permissionAssignment);
		}
		await unitOfWork.gameRepository.create(game);
		await unitOfWork.userRepository.update(context.user);
		await unitOfWork.commit();
		return game;
	};

	joinGame = async (
		context: SecurityContext,
		gameId: string,
		password: string,
		characterName: string
	) => {
		const unitOfWork = this.dbUnitOfWorkFactory();
		const game = await unitOfWork.gameRepository.findById(gameId);
		if (!game) {
			throw new Error("Game does not exist");
		}
		if (game.passwordHash && !bcrypt.compareSync(password, game.passwordHash)) {
			throw new Error("Password is incorrect");
		}
		let permissionAssignment = await unitOfWork.permissionAssignmentRepository.findOne([
			new FilterCondition("permission", GAME_READ),
			new FilterCondition("subjectId", game._id),
			new FilterCondition("subjectType", GAME),
		]);
		if (!permissionAssignment) {
			permissionAssignment = this.permissionAssignmentFactory(null, GAME_READ, game._id, GAME);
			await unitOfWork.permissionAssignmentRepository.create(permissionAssignment);
		}
		context.user.permissions.push(permissionAssignment._id);
		game.characters.push(
			new Character(
				"",
				characterName || context.user.username,
				context.user._id,
				this.genColor(),
				0,
				0,
				0,
				0,
				0,
				0
			)
		);
		await unitOfWork.gameRepository.update(game);
		await this.eventPublisher.publish(ROSTER_CHANGE_EVENT, { gameRosterChange: game });
		await unitOfWork.commit();
		return game;
	};
	leaveGame = async (context: SecurityContext, gameId: string) => {
		const unitOfWork = this.dbUnitOfWorkFactory();
		const game = await unitOfWork.gameRepository.findById(gameId);
		if (!game) {
			throw new Error("Game does not exist");
		}
		if (!game.characters.find((character) => character.player === context.user._id)) {
			throw new Error("You are not in this game");
		}

		game.characters = game.characters.filter((character) => character.player !== context.user._id);
		await unitOfWork.gameRepository.update(game);

		if (game.host === context.user._id) {
			await unitOfWork.gameRepository.delete(game);
			await this.authorizationService.cleanUpPermissions(game._id, unitOfWork);
		} else {
			for (let permission of GAME_PERMISSIONS) {
				const foundPermission = context.permissions.find(
					(assignment) => assignment.permission === permission && assignment.subject === game._id
				);
				if (foundPermission) {
					context.permissions = context.permissions.filter(
						(assignment) => assignment._id === foundPermission._id
					);
					context.user.permissions = context.user.permissions.filter(
						(assignment) => assignment === foundPermission._id
					);
					await unitOfWork.userRepository.update(context.user);
				}
			}
		}

		await this.eventPublisher.publish(ROSTER_CHANGE_EVENT, { gameRosterChange: game });
		await unitOfWork.commit();
		return true;
	};
	gameChat = async (context: SecurityContext, gameId: string, message: string) => {
		const unitOfWork = this.dbUnitOfWorkFactory();
		const game = await unitOfWork.gameRepository.findById(gameId);
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
			const userMessage = new Message(character.name, "all", message, Date.now(), uuidv4());
			messages.push(userMessage);
		}
		game.messages = game.messages.concat(messages);
		await unitOfWork.gameRepository.update(game);

		for (let message of messages) {
			await this.eventPublisher.publish(GAME_CHAT_EVENT, { gameId, gameChat: message });
		}
		await unitOfWork.commit();
		return game;
	};
	setGameMap = async (
		context: SecurityContext,
		gameId: string,
		placeId: string,
		clearPaint: boolean,
		setFog: boolean
	) => {
		const unitOfWork = this.dbUnitOfWorkFactory();
		const game = await unitOfWork.gameRepository.findById(gameId);
		if (!game) {
			throw new Error("Game does not exist");
		}
		if (!(await this.gameAuthorizationRuleSet.canWrite(context, game))) {
			throw new Error("You do not have permission to change the location for this game");
		}
		const place = await unitOfWork.placeRepository.findById(placeId);
		if (!place) {
			throw new Error("Place does not exist");
		}
		if (!place.mapImage) {
			throw new Error("Cannot use a location in game that does not have a map image");
		}
		const newMap = await unitOfWork.imageRepository.findById(place.mapImage);
		if (!place.pixelsPerFoot) {
			throw new Error("Place needs to have pixels per foot defined");
		}

		if (clearPaint && game.map && game.strokes.length > 0) {
			const oldPlace = await unitOfWork.placeRepository.findById(game.map);
			const oldMap = await unitOfWork.imageRepository.findById(oldPlace.mapImage);
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

		await unitOfWork.gameRepository.update(game);
		await unitOfWork.commit();
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
		strokeId: string
	) => {
		const unitOfWork = this.dbUnitOfWorkFactory();
		const game = await unitOfWork.gameRepository.findById(gameId);
		if (!game) {
			throw new Error("Game does not exist");
		}
		if (!(await this.gameAuthorizationRuleSet.userCanPaint(context, game))) {
			throw new Error("You do not have permission to paint for this game");
		}
		const newStroke = new Stroke(strokeId, path, color, size, fill, type);
		game.strokes.push(newStroke);
		await unitOfWork.gameRepository.update(game);
		await this.eventPublisher.publish(GAME_STROKE_EVENT, {
			gameId,
			gameStrokeAdded: newStroke,
		});
		await unitOfWork.commit();
		return game;
	};
	addFogStroke = async (
		context: SecurityContext,
		gameId: string,
		path: PathNode[],
		type: string,
		size: number,
		strokeId: string
	) => {
		const unitOfWork = this.dbUnitOfWorkFactory();
		const game = await unitOfWork.gameRepository.findById(gameId);
		if (!game) {
			throw new Error("Game does not exist");
		}
		if (!(await this.gameAuthorizationRuleSet.userCanWriteFog(context, game))) {
			throw new Error("You do not have permission to edit fog for this game");
		}
		const newStroke = new FogStroke(strokeId, path, size, type);
		game.fog.push(newStroke);
		await unitOfWork.gameRepository.update(game);
		await this.eventPublisher.publish(GAME_FOG_STROKE_ADDED, {
			gameId,
			gameFogStrokeAdded: newStroke,
		});
		await unitOfWork.commit();
		return game;
	};
	addModel = async (
		context: SecurityContext,
		gameId: string,
		modelId: string,
		wikiId: string,
		color: string
	) => {
		const unitOfWork = this.dbUnitOfWorkFactory();
		const game = await unitOfWork.gameRepository.findById(gameId);
		if (!game) {
			throw new Error("Game does not exist");
		}
		if (!(await this.gameAuthorizationRuleSet.userCanModel(context, game))) {
			throw new Error("You do not have permission to change the location for this game");
		}
		const model = await unitOfWork.modelRepository.findById(modelId);
		if (!model) {
			throw new Error("Model does not exist");
		}
		const wiki = await WikiPageModel.findById(wikiId);
		if (wikiId && !wiki) {
			throw new Error(`Cannot find wiki with ID ${wikiId}`);
		}
		const positionedModel = new InGameModel(uuidv4(), modelId, 0, 0, 0, 1, color, wikiId);
		game.models.push(positionedModel);
		await unitOfWork.gameRepository.update(game);
		await this.eventPublisher.publish(GAME_MODEL_ADDED, {
			gameId,
			gameModelAdded: positionedModel,
		});
		await unitOfWork.commit();
		return game;
	};
	setModelPosition = async (
		context: SecurityContext,
		gameId: string,
		positionedModelId: string,
		x: number,
		z: number,
		lookAtX: number,
		lookAtZ: number
	) => {
		const unitOfWork = this.dbUnitOfWorkFactory();
		const game = await unitOfWork.gameRepository.findById(gameId);
		if (!game) {
			throw new Error("Game does not exist");
		}
		if (!(await this.gameAuthorizationRuleSet.userCanModel(context, game))) {
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
		await unitOfWork.gameRepository.update(game);

		await this.eventPublisher.publish(GAME_MODEL_POSITIONED, {
			gameId,
			gameModelPositioned: positionedModel,
		});

		await unitOfWork.commit();
		return positionedModel;
	};
	setModelColor = async (
		context: SecurityContext,
		gameId: string,
		positionedModelId: string,
		color: string
	) => {
		const unitOfWork = this.dbUnitOfWorkFactory();
		const game = await unitOfWork.gameRepository.findById(gameId);
		if (!game) {
			throw new Error("Game does not exist");
		}
		if (!(await this.gameAuthorizationRuleSet.userCanModel(context, game))) {
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
		await unitOfWork.gameRepository.update(game);

		await this.eventPublisher.publish(GAME_MODEL_POSITIONED, {
			gameId,
			gameModelPositioned: positionedModel,
		});

		return positionedModel;
	};
	deletePositionedModel = async (
		context: SecurityContext,
		gameId: string,
		positionedModelId: string
	) => {
		const unitOfWork = this.dbUnitOfWorkFactory();
		const game = await unitOfWork.gameRepository.findById(gameId);
		if (!game) {
			throw new Error("Game does not exist");
		}
		if (!(await this.gameAuthorizationRuleSet.userCanModel(context, game))) {
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
		await unitOfWork.gameRepository.update(game);
		await this.eventPublisher.publish(GAME_MODEL_DELETED, {
			gameId,
			gameModelDeleted: positionedModel,
		});
		await unitOfWork.commit();
		return game;
	};
	setPositionedModelWiki = async (
		context: SecurityContext,
		gameId: string,
		positionedModelId: string,
		wikiId: string
	) => {
		const unitOfWork = this.dbUnitOfWorkFactory();
		const game = await unitOfWork.gameRepository.findById(gameId);
		if (!game) {
			throw new Error("Game does not exist");
		}
		if (!(await this.gameAuthorizationRuleSet.userCanModel(context, game))) {
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
		const wiki = await unitOfWork.wikiPageRepository.findById(wikiId);
		if (!wiki) {
			throw new Error(`Cannot find wiki with ID ${wikiId}`);
		}
		positionedModel.wiki = wiki._id;
		await unitOfWork.gameRepository.update(game);
		await this.eventPublisher.publish(GAME_MODEL_POSITIONED, {
			gameId,
			gameModelPositioned: positionedModel,
		});
		await unitOfWork.commit();
		return positionedModel;
	};
	setCharacterOrder = async (context: SecurityContext, gameId: string, characters: Character[]) => {
		const unitOfWork = this.dbUnitOfWorkFactory();
		const game = await unitOfWork.gameRepository.findById(gameId);
		if (!game) {
			throw new Error("Game does not exist");
		}
		if (!(await this.gameAuthorizationRuleSet.canWrite(context, game))) {
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
		await unitOfWork.gameRepository.update(game);
		await this.eventPublisher.publish(ROSTER_CHANGE_EVENT, { gameRosterChange: game });
		await unitOfWork.commit();
		return game;
	};
	setCharacterAttributes = async (
		context: SecurityContext,
		gameId: string,
		str: number,
		dex: number,
		con: number,
		int: number,
		wis: number,
		cha: number
	) => {
		const unitOfWork = this.dbUnitOfWorkFactory();
		const game = await unitOfWork.gameRepository.findById(gameId);
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
		if (str !== undefined) {
			userCharacter.strength = str;
		}
		if (dex !== undefined) {
			userCharacter.dexterity = dex;
		}
		if (con !== undefined) {
			userCharacter.constitution = con;
		}
		if (int !== undefined) {
			userCharacter.intelligence = int;
		}
		if (wis !== undefined) {
			userCharacter.wisdom = wis;
		}
		if (cha !== undefined) {
			userCharacter.charisma = cha;
		}
		await unitOfWork.gameRepository.update(game);
		await unitOfWork.commit();
		return game;
	};

	getGame = async (context: SecurityContext, gameId: string): Promise<Game> => {
		const foundGame = await this.gameRepository.findById(gameId);
		if (foundGame && !(await this.gameAuthorizationRuleSet.canRead(context, foundGame))) {
			throw new Error("You do not have permission to read this game");
		}
		return foundGame;
	};

	getMyGames = async (context: SecurityContext): Promise<Game[]> => {
		if (context.user.username === ANON_USERNAME) {
			return [];
		}
		return this.gameRepository.find([new FilterCondition("characters.player", context.user._id)]);
	};

	private genColor = () => "#" + Math.floor(Math.random() * 16777215).toString(16);

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
			messages.push(new Message(executor.name, "Server", message, Date.now(), uuidv4()));
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
