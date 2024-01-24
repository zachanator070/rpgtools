import { SessionContext } from "../types";
import { container } from "../di/inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import { GameService } from "../services/game-service";
import { WorldService } from "../services/world-service";
import { ModelService } from "../services/model-service";
import { ServerConfigService } from "../services/server-config-service";
import { UserService } from "../services/user-service";
import { WikiFolderService } from "../services/wiki-folder-service";
import { RoleService } from "../services/role-service";
import { WikiPageService } from "../services/wiki-page-service";

export default {
	currentUser: (_: never, __: never, { securityContext }: SessionContext) => securityContext.user,
	serverConfig: async (_: never, __: never, { databaseContext }: SessionContext) => {
		const service = container.get<ServerConfigService>(INJECTABLE_TYPES.ServerConfigService);
		return service.getServerConfig(databaseContext);
	},
	world: async (
		_: never,
		{ worldId }: { worldId: string },
		{ securityContext, databaseContext }: SessionContext,
	) => {
		const service = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
		return service.getWorld(securityContext, worldId, databaseContext);
	},
	worlds: async (
		_: never,
		{ name, page = 1 }: { name: string; page: number },
		{ securityContext, databaseContext }: SessionContext,
	) => {
		const service = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
		return service.getWorlds(securityContext, name, page, databaseContext);
	},
	wiki: async (
		_: never,
		{ wikiId }: { wikiId: string },
		{ securityContext, databaseContext }: SessionContext,
	) => {
		const service = container.get<WikiPageService>(INJECTABLE_TYPES.WikiPageService);
		return service.getWiki(securityContext, wikiId, databaseContext);
	},
	users: async (
		_: never,
		{ username }: { username: string },
		{ securityContext, databaseContext }: SessionContext,
	) => {
		const service = container.get<UserService>(INJECTABLE_TYPES.UserService);
		return service.getUsers(securityContext, username, 1, databaseContext);
	},
	game: async (
		_: never,
		{ gameId }: { gameId: string },
		{ securityContext, databaseContext }: SessionContext,
	) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return service.getGame(securityContext, gameId, databaseContext);
	},
	myGames: async (_: never, __: never, { securityContext, databaseContext }: SessionContext) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return service.getMyGames(securityContext, databaseContext);
	},
	fogStrokes: async (
		_: never,
		{ gameId, page = 1 }: { gameId: string; page?: number },
		{ securityContext, databaseContext }: SessionContext,
	) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return service.getFogStrokes(gameId, page, securityContext, databaseContext);
	},
	strokes: async (
		_: never,
		{ gameId, page = 1 }: { gameId: string; page?: number },
		{ securityContext, databaseContext }: SessionContext,
	) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return service.getStrokes(gameId, page, securityContext, databaseContext);
	},
	models: async (
		_: never,
		{ worldId }: { worldId: string },
		{ securityContext, databaseContext }: SessionContext,
	) => {
		const service = container.get<ModelService>(INJECTABLE_TYPES.ModelService);
		return service.getModels(securityContext, worldId, databaseContext);
	},
	wikisInFolder: async (
		_: never,
		{ folderId, page = 1 }: { folderId: string; page: number },
		{ securityContext, databaseContext }: SessionContext,
	) => {
		const service = container.get<WikiPageService>(INJECTABLE_TYPES.WikiPageService);
		return service.getWikisInFolder(securityContext, folderId, page, databaseContext);
	},
	folders: async (
		_: never,
		{ worldId, name, canAdmin }: { worldId: string; name: string; canAdmin: boolean },
		{ securityContext, databaseContext }: SessionContext,
	) => {
		const service = container.get<WikiFolderService>(INJECTABLE_TYPES.WikiFolderService);
		return service.getFolders(securityContext, worldId, name, canAdmin, databaseContext);
	},
	wikis: async (
		_: never,
		{
			worldId,
			name,
			types,
			canAdmin,
			hasModel,
			page = 1,
		}: {
			worldId: string;
			name: string;
			types: string[];
			canAdmin: boolean;
			hasModel: boolean;
			page: number;
		},
		{ securityContext, databaseContext }: SessionContext,
	) => {
		const service = container.get<WikiPageService>(INJECTABLE_TYPES.WikiPageService);
		return service.searchWikis(
			securityContext,
			worldId,
			name,
			types,
			canAdmin,
			hasModel,
			page,
			databaseContext,
		);
	},
	roles: async (
		_: never,
		{
			worldId,
			name,
			canAdmin,
			page = 1,
		}: { worldId: string; name: string; canAdmin: boolean; page: number },
		{ securityContext, databaseContext }: SessionContext,
	) => {
		const service = container.get<RoleService>(INJECTABLE_TYPES.RoleService);
		return service.getRoles(securityContext, worldId, name, canAdmin, page, databaseContext);
	},
	pins: async (
		_: never,
		{ worldId, page = 1 }: { worldId: string; name: string; canAdmin: boolean; page: number },
		{ securityContext, databaseContext }: SessionContext,
	) => {
		const service = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
		return service.getPins(securityContext, worldId, page, databaseContext);
	},
	getFolderPath: async (
		_: never,
		{ wikiId }: { wikiId: string },
		{ securityContext, databaseContext }: SessionContext,
	) => {
		const service = container.get<WikiFolderService>(INJECTABLE_TYPES.WikiFolderService);
		return service.getFolderPath(securityContext, wikiId, databaseContext);
	},
	calendars: async (
		_: never,
		{ worldId }: { worldId: string },
		{ securityContext, databaseContext }: SessionContext,
	) => {
		const service = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
		return service.getCalendars(worldId, securityContext, databaseContext);
	},
	events: async (
		_: never,
		{
			worldId,
			relatedWikiIds,
			calendarIds,
		}: { worldId: string; relatedWikiIds: string[]; calendarIds: string[] },
		{ securityContext, databaseContext }: SessionContext,
	) => {
		const service = container.get<WikiPageService>(INJECTABLE_TYPES.WikiPageService);
		return service.getEvents(
			worldId,
			securityContext,
			databaseContext,
			relatedWikiIds,
			calendarIds,
		);
	},
};
