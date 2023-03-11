import {
	SessionContext,
} from "../types";
import { container } from "../di/inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import {GameService} from "../services/game-service";
import {WorldService} from "../services/world-service";
import {ModelService} from "../services/model-service";
import {ServerConfigService} from "../services/server-config-service";
import {UserService} from "../services/user-service";
import {WikiFolderService} from "../services/wiki-folder-service";
import {RoleService} from "../services/role-service";
import {WikiPageService} from "../services/wiki-page-service";

export default {
	currentUser: (_: any, __: any, { securityContext }: SessionContext) => securityContext.user,
	serverConfig: async (_: any, __: any, { databaseContext }: SessionContext) => {
		const service = container.get<ServerConfigService>(INJECTABLE_TYPES.ServerConfigService);
		return service.getServerConfig(databaseContext);
	},
	world: async (_: any, { worldId }: { worldId: string }, { securityContext, databaseContext }: SessionContext) => {
		const service = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
		return service.getWorld(securityContext, worldId, databaseContext);
	},
	worlds: async (_: any, { name, page }: { name: string, page: number }, { securityContext, databaseContext }: SessionContext) => {
		const service = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
		return service.getWorlds(securityContext, name, page, databaseContext);
	},
	wiki: async (_: any, { wikiId }: { wikiId: string }, { securityContext, databaseContext }: SessionContext) => {
		const service = container.get<WikiPageService>(INJECTABLE_TYPES.WikiPageService);
		return service.getWiki(securityContext, wikiId, databaseContext);
	},
	users: async (
		_: any,
		{ username }: { username: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<UserService>(INJECTABLE_TYPES.UserService);
		return service.getUsers(securityContext, username, 1, databaseContext);
	},
	game: async (_: any, { gameId }: { gameId: string }, { securityContext, databaseContext }: SessionContext) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return service.getGame(securityContext, gameId, databaseContext);
	},
	myGames: async (_: any, __: any, { securityContext, databaseContext }: SessionContext) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return service.getMyGames(securityContext, databaseContext);
	},
	fogStrokes: async (_: any, { gameId, page }: { gameId: string, page?: number }, { securityContext, databaseContext }: SessionContext) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return service.getFogStrokes(gameId, page, securityContext, databaseContext);
	},
	strokes: async (_: any, { gameId, page }: { gameId: string, page?: number }, { securityContext, databaseContext }: SessionContext) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return service.getStrokes(gameId, page, securityContext, databaseContext);
	},
	models: async (_: any, { worldId }: { worldId: string }, { securityContext, databaseContext }: SessionContext) => {
		const service = container.get<ModelService>(INJECTABLE_TYPES.ModelService);
		return service.getModels(securityContext, worldId, databaseContext);
	},
	wikisInFolder: async (
		_: any,
		{ folderId, page = 1 }: { folderId: string; page: number },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<WikiPageService>(INJECTABLE_TYPES.WikiPageService);
		return service.getWikisInFolder(securityContext, folderId, page, databaseContext);
	},
	folders: async (
		_: any,
		{ worldId, name, canAdmin }: { worldId: string; name: string; canAdmin: boolean },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<WikiFolderService>(INJECTABLE_TYPES.WikiFolderService);
		return service.getFolders(securityContext, worldId, name, canAdmin, databaseContext);
	},
	wikis: async (
		_: any,
		{worldId, name, types, canAdmin, hasModel, page}: {worldId: string, name: string, types: string[], canAdmin: boolean, hasModel: boolean, page: number},
		{ securityContext, databaseContext }: SessionContext) => {
		const service = container.get<WikiPageService>(INJECTABLE_TYPES.WikiPageService);
		return service.searchWikis(securityContext, worldId, name, types, canAdmin, hasModel, page, databaseContext);
	},
	roles: async (
		_: any,
		{
			worldId,
			name,
			canAdmin,
			page = 1,
		}: { worldId: string; name: string; canAdmin: boolean; page: number },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<RoleService>(INJECTABLE_TYPES.RoleService);
		return service.getRoles(securityContext, worldId, name, canAdmin, page, databaseContext);
	},
	pins: async (
		_: any,
		{
			worldId,
			name,
			canAdmin,
			page = 1,
		}: { worldId: string; name: string; canAdmin: boolean; page: number },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
		return service.getPins(securityContext, worldId, page, databaseContext);
	},
	getFolderPath: async (
		_: any,
		{ wikiId }: { wikiId: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<WikiFolderService>(INJECTABLE_TYPES.WikiFolderService);
		return service.getFolderPath(securityContext, wikiId, databaseContext);
	},
	calendars: async (
		_: any,
		{ worldId } : { worldId: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
		return service.getCalendars(worldId, securityContext, databaseContext);
	}
};
