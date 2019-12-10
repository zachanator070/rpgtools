import {ALL_USERS, EVERYONE} from "../role-constants";
import mongoose from 'mongoose';
import {
	FOLDER_READ,
	FOLDER_READ_ALL, FOLDER_RW, FOLDER_RW_ALL,
	GAME_HOST, GAME_READ, GAME_WRITE,
	ROLE_ADMIN,
	WIKI_READ,
	WIKI_READ_ALL,
	WIKI_RW,
	WIKI_RW_ALL, WORLD_CREATE,
	WORLD_READ
} from "../permission-constants";

import {Role} from './models/role';
import {WikiPage} from './models/wiki-page';
import {WikiFolder} from './models/wiki-folder';
import {Game} from './models/game';
import {World} from './models/world';


export const userHasPermission = async function (user, permission, subjectId) {
	if(subjectId instanceof String){
		subjectId = new mongoose.Types.ObjectId(subjectId);
	}

	// first check direct assignment
	if (user) {
		for (const userPermission of user.permissions) {
			if (userPermission.permission === permission && userPermission.subjectId ? userPermission.subjectId.equals(subjectId) : userPermission.subjectId === subjectId) {
				return true;
			}
		}
	}

	const userRoles = user ? [...user.roles] : [];

	// add "All Users" default role to be checked
	const allUsersRole = await Role.findOne({name: ALL_USERS});
	if(allUsersRole){
		userRoles.push(allUsersRole);
	}

	// add "Everyone" default role assigned to world to be checked
	const world = await getWorldFromPermission(permission, subjectId);
	if(world){
		// get permissions for everyone in the world
		const everyoneRole = await Role.findOne({name: EVERYONE, world: world._id});
		if (everyoneRole) {
			userRoles.push(everyoneRole);
		}
	}

	// next check all roles assigned to user for permission
	for (const role of userRoles) {
		// first check direct assignment
		for (const rolePermission of role.permissions) {
			if (rolePermission.permission === permission && rolePermission.subjectId ? rolePermission.subjectId.equals(subjectId) : rolePermission.subjectId === subjectId) {
				return true;
			}
		}
	}

	return false;
};

export const getWorldFromPermission = async (permission, subjectId) => {
	let world = null;
	switch(permission){
		case ROLE_ADMIN:
		case WORLD_READ:
		case WIKI_READ_ALL:
		case WIKI_RW_ALL:
		case FOLDER_READ_ALL:
		case FOLDER_RW_ALL:
		case GAME_HOST:
			world = subjectId;
			break;
		case WIKI_READ:
		case WIKI_RW:
			const wiki = await WikiPage.findById(subjectId);
			if(wiki){
				world = wiki.world;
			}
			break;
		case FOLDER_READ:
		case FOLDER_RW:
			const folder = await WikiFolder.findById(subjectId);
			if(folder){
				world = folder.world;
			}
			break;
		case GAME_READ:
		case GAME_WRITE:
			const game = await Game.findById(subjectId);
			if(game){
				world = game.world;
			}
			break;
		case WORLD_CREATE:
		default:
			break;
	}
	if(world) {
		world = await World.findById(world);
	}
	return world;
};