export const ROLE_ADMIN = 'Able to add or remove members from a role';
export const ROLE_ADMIN_ALL = 'Able to edit any role in this world';
export const WORLD_READ = 'See this world in search results';
export const WIKI_READ_ALL = 'Read all wiki pages';
export const WIKI_RW_ALL = 'Write to any wiki page';
export const WIKI_READ = 'Read access to a single wiki page';
export const WIKI_RW = 'Write access to a single wiki page';
export const FOLDER_READ_ALL = 'Read all wiki folders';
export const FOLDER_RW_ALL = 'Write to any wiki folder';
export const FOLDER_READ = 'Read access to a single wiki folder';
export const FOLDER_RW = 'Write access to a single wiki folder';
export const GAME_HOST = 'Able to host games';
export const GAME_READ = 'Read access to a single game';
export const GAME_WRITE = 'Edit access to a single game';
export const WORLD_CREATE = 'Create world access';

// probably a better way to do this
export const ALL_PERMISSIONS = [
	ROLE_ADMIN,
	ROLE_ADMIN_ALL,
	WORLD_READ,
	WIKI_READ_ALL,
	WIKI_RW_ALL,
	WIKI_READ,
	WIKI_RW,
	FOLDER_READ_ALL,
	FOLDER_RW_ALL,
	FOLDER_READ,
	FOLDER_RW,
	GAME_HOST,
	GAME_READ,
	GAME_WRITE,
	WORLD_CREATE
];

export const ROLE_PERMISSIONS = [ROLE_ADMIN];

export const WIKI_PERMISSIONS = [WIKI_READ, WIKI_RW];

export const WORLD_PERMISSIONS = [ROLE_ADMIN_ALL, WORLD_READ, WIKI_READ_ALL, WIKI_RW_ALL, FOLDER_READ_ALL, FOLDER_RW_ALL, GAME_HOST];

export const WIKI_FOLDER_PERMISSIONS = [FOLDER_READ, FOLDER_RW];

export const GAME_PERMISSIONS = [GAME_READ, GAME_WRITE];

export const PUBLIC_WORLD_PERMISSIONS = [WIKI_READ_ALL, FOLDER_READ_ALL, WORLD_READ];