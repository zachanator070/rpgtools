import {
	GameService,
	ModelService,
	RoleService,
	ServerConfigService,
	SessionContext,
	UserService,
	WikiFolderService,
	WikiPageService,
	WorldService,
} from "../types";
import { container } from "../inversify.config";
import { INJECTABLE_TYPES } from "../injectable-types";

export default {
	currentUser: (_: any, __: any, { securityContext }: SessionContext) => securityContext.user,
	serverConfig: async () => {
		const service = container.get<ServerConfigService>(INJECTABLE_TYPES.ServerConfigService);
		return service.getServerConfig;
	},
	world: async (_: any, { worldId }: { worldId: string }, { securityContext }: SessionContext) => {
		const service = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
		return service.getWorld(securityContext, worldId);
	},
	worlds: async (_: any, { page }: { page: number }, { securityContext }: SessionContext) => {
		const service = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
		return service.getWorlds(securityContext, page);
	},
	wiki: async (_: any, { wikiId }: { wikiId: string }, { securityContext }: SessionContext) => {
		const service = container.get<WikiPageService>(INJECTABLE_TYPES.WikiPageService);
		return service.getWiki(securityContext, wikiId);
	},
	users: async (
		_: any,
		{ username }: { username: string },
		{ securityContext }: SessionContext
	) => {
		const service = container.get<UserService>(INJECTABLE_TYPES.UserService);
		return service.getUsers(securityContext, username);
	},
	game: async (_: any, { gameId }: { gameId: string }, { securityContext }: SessionContext) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return service.getGame(securityContext, gameId);
	},
	myGames: async (_: any, __: any, { securityContext }: SessionContext) => {
		const service = container.get<GameService>(INJECTABLE_TYPES.GameService);
		return service.getMyGames(securityContext);
	},
	models: async (_: any, { worldId }: { worldId: string }, { securityContext }: SessionContext) => {
		const service = container.get<ModelService>(INJECTABLE_TYPES.ModelService);
		return service.getModels(securityContext, worldId);
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
		{ securityContext }: SessionContext
	) => {
		const service = container.get<WikiPageService>(INJECTABLE_TYPES.WikiPageService);
		return service.getWikisInFolder(securityContext, folderId, page);
	},
	folders: async (
		_: any,
		{ worldId, name, canAdmin }: { worldId: string; name: string; canAdmin: boolean },
		{ securityContext }: SessionContext
	) => {
		const service = container.get<WikiFolderService>(INJECTABLE_TYPES.WikiFolderService);
		return service.getFolders(securityContext, worldId, name, canAdmin);
	},
	roles: async (
		_: any,
		{
			worldId,
			name,
			canAdmin,
			page = 1,
		}: { worldId: string; name: string; canAdmin: boolean; page: number },
		{ securityContext }: SessionContext
	) => {
		const service = container.get<RoleService>(INJECTABLE_TYPES.RoleService);
		return service.getRoles(securityContext, worldId, name, canAdmin, page);
	},
	getFolderPath: async (
		_: any,
		{ wikiId }: { wikiId: string },
		{ securityContext }: SessionContext
	) => {
		const service = container.get<WikiFolderService>(INJECTABLE_TYPES.WikiFolderService);
		return service.getFolderPath(securityContext, wikiId);
	},
};
