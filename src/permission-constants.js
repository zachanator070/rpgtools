export const ROLE_ADMIN = 'Able to Assign Roles or Permissions to Users and Create or Change Role Definitions';
export const WORLD_READ = 'Read Access to this World';
export const WIKI_READ_ALL = 'Read All Wiki Pages';
export const WIKI_WRITE_ALL = 'Write to Any Wiki Page';
export const GAME_HOST = 'Able to Host Games';
export const WIKI_READ = 'Read Access to a Single Wiki Page';
export const WIKI_WRITE = 'Write Access to a Single Wiki Page';
export const GAME_READ = 'Read Access to a Single Game';
export const GAME_WRITE = 'Edit Access to a Single Game';
export const WORLD_CREATE = 'Create World Access';

// probably a better way to do this
export const ALL_PERMISSIONS = [
	ROLE_ADMIN,
	WORLD_READ,
	WIKI_READ_ALL,
	WIKI_WRITE_ALL,
	GAME_HOST,
	WIKI_READ,
	WIKI_WRITE,
	GAME_READ,
	GAME_WRITE,
	WORLD_CREATE
];
