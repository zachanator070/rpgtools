import {
	ALL_WIKI_TYPES,
	GAME,
	MODEL,
	ROLE,
	SERVER_CONFIG,
	WIKI_FOLDER,
	WIKI_PAGE,
	WORLD,
} from "./type-constants";

// server permissions
export const WORLD_CREATE = "Create world access";
export const WORLD_ADMIN_ALL = "Able to change permissions for all worlds";
export const WORLD_READ_ALL = "Able to read all worlds";
export const WORLD_RW_ALL = "Able to write to any world";
export const SERVER_ADMIN = "Able to change permissions for this server";
export const SERVER_RW = "Able to edit this server";

export const SERVER_PERMISSIONS = [
	WORLD_CREATE,
	WORLD_ADMIN_ALL,
	WORLD_READ_ALL,
	WORLD_RW_ALL,
	SERVER_ADMIN,
	SERVER_RW,
];

// world permissions
export const WORLD_READ = "See this world in search results";
export const WORLD_ADMIN = "Able to change permissions for this world";
export const WORLD_RW = "Able to write to this world";
export const WIKI_READ_ALL = "Read all wiki pages";
export const WIKI_RW_ALL = "Write to any wiki page";
export const WIKI_ADMIN_ALL = "Able to change permissions for any wiki pages";
export const FOLDER_READ_ALL = "Read all wiki folders";
export const FOLDER_RW_ALL = "Write to any wiki folder";
export const FOLDER_ADMIN_ALL = "Able to change permissions for any folder";
export const GAME_HOST = "Able to host games";
export const GAME_ADMIN_ALL = "Able to change permissions for any game";
export const ROLE_ADD = "Able to create roles in this world";
export const ROLE_READ_ALL = "Read all roles";
export const ROLE_RW_ALL = "Write to any role";
export const ROLE_ADMIN_ALL = "Able to change permissions for any role";
export const MODEL_ADD = "Able to create models in this world";
export const MODEL_READ_ALL = "Read all models";
export const MODEL_RW_ALL = "Write to any models";
export const MODEL_ADMIN_ALL = "Able to change permissions for any model";

export const WORLD_PERMISSIONS = [
	WORLD_READ,
	WORLD_ADMIN,
	WIKI_READ_ALL,
	WIKI_RW_ALL,
	WIKI_ADMIN_ALL,
	FOLDER_READ_ALL,
	FOLDER_RW_ALL,
	FOLDER_ADMIN_ALL,
	GAME_HOST,
	GAME_ADMIN_ALL,
	ROLE_ADD,
	ROLE_READ_ALL,
	ROLE_RW_ALL,
	ROLE_ADMIN_ALL,
	MODEL_ADD,
	MODEL_READ_ALL,
	MODEL_RW_ALL,
	MODEL_ADMIN_ALL,
	WORLD_RW,
];

// role permissions
export const ROLE_READ = "Able to see members of this role";
export const ROLE_RW = "Able to change members of this role";
export const ROLE_ADMIN = "Able to change permissions for this role";

export const ROLE_PERMISSIONS = [ROLE_READ, ROLE_RW, ROLE_ADMIN];

// wiki permissions
export const WIKI_READ = "Read access to a single wiki page";
export const WIKI_RW = "Write access to a single wiki page";
export const WIKI_ADMIN = "Able to change permissions for a single wiki page";

export const WIKI_PERMISSIONS = [WIKI_READ, WIKI_RW, WIKI_ADMIN];

// folder permissions
export const FOLDER_READ = "Read access to a single wiki folder";
export const FOLDER_RW = "Write access to a single wiki folder";
export const FOLDER_ADMIN = "Able to change permissions for a single wiki folder";
export const FOLDER_READ_ALL_CHILDREN = "Able to read any direct child folder of a wiki folder";
export const FOLDER_RW_ALL_CHILDREN = "Able to write to any direct child folder of a wiki folder";
export const FOLDER_READ_ALL_PAGES = "Able to read any wiki page in a wiki folder";
export const FOLDER_RW_ALL_PAGES = "Able to write to any wiki page in a wiki folder";

export const WIKI_FOLDER_PERMISSIONS = [
	FOLDER_READ,
	FOLDER_RW,
	FOLDER_ADMIN,
	FOLDER_READ_ALL_CHILDREN,
	FOLDER_RW_ALL_CHILDREN,
	FOLDER_READ_ALL_PAGES,
	FOLDER_RW_ALL_PAGES,
];

// model permissions
export const MODEL_READ = "Read access to a single model";
export const MODEL_RW = "Edit access to a single model";
export const MODEL_ADMIN = "Able to change permissions for a single model";

export const MODEL_PERMISSIONS = [MODEL_READ, MODEL_RW, MODEL_ADMIN];

// game permissions
export const GAME_READ = "Read access to a single game";
export const GAME_PAINT = "Access to paint in a game";
export const GAME_MODEL = "Access to add, remove, or change models in a game";
export const GAME_FOG_WRITE = "Access to edit fog of a single game";
export const GAME_ADMIN = "Able to change permissions for a single game";
export const GAME_RW = "Able to change the location for a game";

export const GAME_PERMISSIONS = [
	GAME_READ,
	GAME_PAINT,
	GAME_MODEL,
	GAME_RW,
	GAME_FOG_WRITE,
	GAME_ADMIN,
];

const allPermissions: string[] = [];
export const ALL_PERMISSIONS = allPermissions.concat(
	SERVER_PERMISSIONS,
	WORLD_PERMISSIONS,
	ROLE_PERMISSIONS,
	WIKI_PERMISSIONS,
	WIKI_FOLDER_PERMISSIONS,
	MODEL_PERMISSIONS,
	GAME_PERMISSIONS
);

export const PUBLIC_WORLD_PERMISSIONS = [
	WIKI_READ_ALL,
	FOLDER_READ_ALL,
	WORLD_READ,
	MODEL_READ_ALL,
];

export const getPermissionsBySubjectType = (subjectType: string) => {
	if (subjectType === ROLE) {
		return ROLE_PERMISSIONS;
	} else if (subjectType === WIKI_PAGE || ALL_WIKI_TYPES.includes(subjectType)) {
		return WIKI_PERMISSIONS;
	} else if (subjectType === WORLD) {
		return WORLD_PERMISSIONS;
	} else if (subjectType === WIKI_FOLDER) {
		return WIKI_FOLDER_PERMISSIONS;
	} else if (subjectType === GAME) {
		return GAME_PERMISSIONS;
	} else if (subjectType === SERVER_CONFIG) {
		return SERVER_PERMISSIONS;
	} else if (subjectType === MODEL) {
		return MODEL_PERMISSIONS;
	}
	return null;
};

export const ANON_USERNAME = "Anonymous";
export const SERVER_ADMIN_ROLE = "Server Admin";
