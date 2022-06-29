import { INJECTABLE_TYPES } from "../../di/injectable-types";
import { GameService, SessionContext } from "../../types";
import { container } from "../../di/inversify";
import { Character, PathNode } from "../../domain-entities/game";

export const gameMutations = {
	createGame: async (
		_: any,
		{
			worldId,
			password,
			characterName,
		}: { worldId: string; password: string; characterName: string },
		{ securityContext }: SessionContext
	) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return await service.createGame(securityContext, worldId, password, characterName);
	},
	joinGame: async (
		_: any,
		{
			gameId,
			password,
			characterName,
		}: { gameId: string; password: string; characterName: string },
		{ securityContext }: SessionContext
	) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return await service.joinGame(securityContext, gameId, password, characterName);
	},
	leaveGame: async (
		_: any,
		{ gameId }: { gameId: string },
		{ securityContext }: SessionContext
	) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return await service.leaveGame(securityContext, gameId);
	},
	gameChat: async (
		_: any,
		{ gameId, message }: { gameId: string; message: string },
		{ securityContext }: SessionContext
	) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return await service.gameChat(securityContext, gameId, message);
	},
	setGameMap: async (
		_: any,
		{
			gameId,
			placeId,
			clearPaint,
			setFog,
		}: { gameId: string; placeId: string; clearPaint: boolean; setFog: boolean },
		{ securityContext }: SessionContext
	) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return await service.setGameMap(securityContext, gameId, placeId, clearPaint, setFog);
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
		{ securityContext }: SessionContext
	) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return await service.addStroke(
			securityContext,
			gameId,
			path,
			type,
			size,
			color,
			fill,
			strokeId
		);
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
		{ securityContext }: SessionContext
	) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return service.addFogStroke(securityContext, gameId, path, type, size, strokeId);
	},
	addModel: async (
		_: any,
		{
			gameId,
			modelId,
			wikiId,
			color,
		}: { gameId: string; modelId: string; wikiId: string; color: string },
		{ securityContext }: SessionContext
	) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return await service.addModel(securityContext, gameId, modelId, wikiId, color);
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
		{ securityContext }: SessionContext
	) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return service.setModelPosition(
			securityContext,
			gameId,
			positionedModelId,
			x,
			z,
			lookAtX,
			lookAtZ
		);
	},
	setModelColor: async (
		_: any,
		{
			gameId,
			positionedModelId,
			color,
		}: { gameId: string; positionedModelId: string; color: string },
		{ securityContext }: SessionContext
	) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return service.setModelColor(securityContext, gameId, positionedModelId, color);
	},
	deletePositionedModel: async (
		_: any,
		{ gameId, positionedModelId }: { gameId: string; positionedModelId: string },
		{ securityContext }: SessionContext
	) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return service.deletePositionedModel(securityContext, gameId, positionedModelId);
	},
	setPositionedModelWiki: async (
		_: any,
		{
			gameId,
			positionedModelId,
			wikiId,
		}: { gameId: string; positionedModelId: string; wikiId: string },
		{ securityContext }: SessionContext
	) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return service.setPositionedModelWiki(securityContext, gameId, positionedModelId, wikiId);
	},
	setCharacterOrder: async (
		_: any,
		{ gameId, characters }: { gameId: string; characters: Character[] },
		{ securityContext }: SessionContext
	) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return service.setCharacterOrder(securityContext, gameId, characters);
	},
	setCharacterAttributes: async (
		_: any,
		{
			gameId,
			str,
			dex,
			con,
			int,
			wis,
			cha,
		}: {
			gameId: string;
			str: number;
			dex: number;
			con: number;
			int: number;
			wis: number;
			cha: number;
		},
		{ securityContext }: SessionContext
	) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return service.setCharacterAttributes(securityContext, gameId, str, dex, con, int, wis, cha);
	},
};
