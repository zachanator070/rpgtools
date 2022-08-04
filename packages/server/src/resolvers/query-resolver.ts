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
	serverConfig: async ({ unitOfWork }: SessionContext) => {
		const service = container.get<ServerConfigService>(INJECTABLE_TYPES.ServerConfigService);
		return service.getServerConfig(unitOfWork);
	},
	world: async (_: any, { worldId }: { worldId: string }, { securityContext, unitOfWork }: SessionContext) => {
		const service = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
		return service.getWorld(securityContext, worldId, unitOfWork);
	},
	worlds: async (_: any, { name, page }: { name: string, page: number }, { securityContext, unitOfWork }: SessionContext) => {
		const service = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
		return service.getWorlds(securityContext, name, page, unitOfWork);
	},
	wiki: async (_: any, { wikiId }: { wikiId: string }, { securityContext, unitOfWork }: SessionContext) => {
		const service = container.get<WikiPageService>(INJECTABLE_TYPES.WikiPageService);
		return service.getWiki(securityContext, wikiId, unitOfWork);
	},
	users: async (
		_: any,
		{ username, page }: { username: string, page: number },
		{ securityContext, unitOfWork }: SessionContext
	) => {
		const service = container.get<UserService>(INJECTABLE_TYPES.UserService);
		return service.getUsers(securityContext, username, page, unitOfWork);
	},
	game: async (_: any, { gameId }: { gameId: string }, { securityContext, unitOfWork }: SessionContext) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return service.getGame(securityContext, gameId, unitOfWork);
	},
	myGames: async (_: any, __: any, { securityContext, unitOfWork }: SessionContext) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return service.getMyGames(securityContext, unitOfWork);
	},
	models: async (_: any, { worldId }: { worldId: string }, { securityContext, unitOfWork }: SessionContext) => {
		const service = container.get<ModelService>(INJECTABLE_TYPES.ModelService);
		return service.getModels(securityContext, worldId, unitOfWork);
	},
	myPermissions: async (
		_: any,
		{ worldId }: { worldId: string },
		{ securityContext }: SessionContext
	) => {
		return securityContext.permissions;
	},
	wikisInFolder: async (
		_: any,
		{ folderId, page = 1 }: { folderId: string; page: number },
		{ securityContext, unitOfWork }: SessionContext
	) => {
		const service = container.get<WikiPageService>(INJECTABLE_TYPES.WikiPageService);
		return service.getWikisInFolder(securityContext, folderId, page, unitOfWork);
	},
	folders: async (
		_: any,
		{ worldId, name, canAdmin }: { worldId: string; name: string; canAdmin: boolean },
		{ securityContext, unitOfWork }: SessionContext
	) => {
		const service = container.get<WikiFolderService>(INJECTABLE_TYPES.WikiFolderService);
		return service.getFolders(securityContext, worldId, name, canAdmin, unitOfWork);
	},
	wikis: async (
		_: any,
		{worldId, name, types, canAdmin}: {worldId: string, name: string, types: string[], canAdmin: boolean},
		{ securityContext, unitOfWork }: SessionContext) => {
		const service = container.get<WikiPageService>(INJECTABLE_TYPES.WikiPageService);
		return service.searchWikis(securityContext, worldId, name, types, canAdmin, unitOfWork);
	},
	roles: async (
		_: any,
		{
			worldId,
			name,
			canAdmin,
			page = 1,
		}: { worldId: string; name: string; canAdmin: boolean; page: number },
		{ securityContext, unitOfWork }: SessionContext
	) => {
		const service = container.get<RoleService>(INJECTABLE_TYPES.RoleService);
		return service.getRoles(securityContext, worldId, name, canAdmin, page, unitOfWork);
	},
	getFolderPath: async (
		_: any,
		{ wikiId }: { wikiId: string },
		{ securityContext, unitOfWork }: SessionContext
	) => {
		const service = container.get<WikiFolderService>(INJECTABLE_TYPES.WikiFolderService);
		return service.getFolderPath(securityContext, wikiId, unitOfWork);
	},
};
