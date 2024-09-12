import { INJECTABLE_TYPES } from "../../di/injectable-types.js";
import { SessionContext } from "../../types";
import { container } from "../../di/inversify.js";
import {Character, CharacterAttribute, PathNode} from "../../domain-entities/game.js";
import {GameService} from "../../services/game-service.js";

export const gameMutations = {
	createGame: async (
		_: any,
		{
			worldId,
			password,
			characterName,
		}: { worldId: string; password: string; characterName: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return await databaseContext.openTransaction(async () => service.createGame(securityContext, worldId, password, characterName, databaseContext));
	},
	joinGame: async (
		_: any,
		{
			gameId,
			password,
			characterName,
		}: { gameId: string; password: string; characterName: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return await databaseContext.openTransaction(async () => service.joinGame(securityContext, gameId, password, characterName, databaseContext));
	},
	leaveGame: async (
		_: any,
		{ gameId }: { gameId: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return await databaseContext.openTransaction(async () => service.leaveGame(securityContext, gameId, databaseContext));
	},
	gameChat: async (
		_: any,
		{ gameId, message }: { gameId: string; message: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return await databaseContext.openTransaction(async () => service.gameChat(securityContext, gameId, message, databaseContext));
	},
	setGameMap: async (
		_: any,
		{
			gameId,
			placeId,
			setFog,
		}: { gameId: string; placeId: string; clearPaint: boolean; setFog: boolean },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return await databaseContext.openTransaction(async () => service.setGameMap(securityContext, gameId, placeId, setFog, databaseContext));
	},
	addStroke: async (
		_: any,
		{
			gameId,
			path,
			type,
			size,
			color,
			fill,
			strokeId,
		}: {
			gameId: string;
			path: PathNode[];
			type: string;
			size: number;
			color: string;
			fill: boolean;
			strokeId: string;
		},
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return await databaseContext.openTransaction(async () => service.addStroke(
			securityContext,
			gameId,
			path,
			type,
			size,
			color,
			fill,
			strokeId,
			databaseContext
		));
	},
	addFogStroke: async (
		_: any,
		{
			gameId,
			path,
			type,
			size,
			strokeId,
		}: { gameId: string; path: PathNode[]; type: string; size: number; strokeId: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return await databaseContext.openTransaction(async () => service.addFogStroke(securityContext, gameId, path, type, size, strokeId, databaseContext));
	},
	addModel: async (
		_: any,
		{
			gameId,
			modelId,
			wikiId,
			color,
		}: { gameId: string; modelId: string; wikiId: string; color: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return await databaseContext.openTransaction(async () => service.addModel(securityContext, gameId, modelId, wikiId, color, databaseContext));
	},
	setModelPosition: async (
		_: any,
		{
			gameId,
			positionedModelId,
			x,
			z,
			lookAtX,
			lookAtZ,
		}: {
			gameId: string;
			positionedModelId: string;
			x: number;
			z: number;
			lookAtX: number;
			lookAtZ: number;
		},
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return await databaseContext.openTransaction(async () => service.setModelPosition(
			securityContext,
			gameId,
			positionedModelId,
			x,
			z,
			lookAtX,
			lookAtZ,
			databaseContext
		));
	},
	setModelColor: async (
		_: any,
		{
			gameId,
			positionedModelId,
			color,
		}: { gameId: string; positionedModelId: string; color: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return await databaseContext.openTransaction(async () => service.setModelColor(securityContext, gameId, positionedModelId, color, databaseContext));
	},
	deletePositionedModel: async (
		_: any,
		{ gameId, positionedModelId }: { gameId: string; positionedModelId: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return await databaseContext.openTransaction(async () => service.deletePositionedModel(securityContext, gameId, positionedModelId, databaseContext));
	},
	setPositionedModelWiki: async (
		_: any,
		{
			gameId,
			positionedModelId,
			wikiId,
		}: { gameId: string; positionedModelId: string; wikiId: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return await databaseContext.openTransaction(async () => service.setPositionedModelWiki(securityContext, gameId, positionedModelId, wikiId, databaseContext));
	},
	setCharacterOrder: async (
		_: any,
		{ gameId, characters }: { gameId: string; characters: Character[] },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return await databaseContext.openTransaction(async () => service.setCharacterOrder(securityContext, gameId, characters, databaseContext));
	},
	setCharacterAttributes: async (
		_: any,
		{
			gameId,
			attributes
		}: {
			gameId: string;
			attributes: CharacterAttribute[]
		},
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return await databaseContext.openTransaction(async () => service.setCharacterAttributes(securityContext, gameId, attributes, databaseContext));
	},
};
