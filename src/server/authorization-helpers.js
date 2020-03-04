import {ALL_USERS, EVERYONE} from "../role-constants";
import mongoose from 'mongoose';
import {
	FOLDER_READ,
	FOLDER_READ_ALL, FOLDER_RW, FOLDER_RW_ALL,
	GAME_HOST, GAME_PERMISSIONS, GAME_READ, GAME_WRITE,
	ROLE_ADMIN, WIKI_FOLDER_PERMISSIONS, WIKI_PERMISSIONS,
	WIKI_READ,
	WIKI_READ_ALL,
	WIKI_RW,
	WIKI_RW_ALL, WORLD_CREATE, WORLD_PERMISSIONS,
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

	if(subjectId instanceof mongoose.Model){
		subjectId = subjectId._id;
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

export const getSubjectFromPermission = async (permission, subjectId) => {
	if(WORLD_PERMISSIONS.includes(permission)){
		return World.findById(subjectId).populate('userPermissionAssignments rolePermissionAssignments');
	}
	else if(WIKI_PERMISSIONS.includes(permission)){
		return WikiPage.findById(subjectId).populate('userPermissionAssignments rolePermissionAssignments');
	}
	else if(WIKI_FOLDER_PERMISSIONS.includes(permission)){
		return WikiFolder.findById(subjectId).populate('userPermissionAssignments rolePermissionAssignments');
	}
	else if(GAME_PERMISSIONS.includes(permission)){
		return Game.findById(subjectId).populate('userPermissionAssignments rolePermissionAssignments');
	}
	return null;
};

export const getWorldFromPermission = async (permission, subjectId) => {

	let worldId = null;

	if(WORLD_PERMISSIONS.includes(permission)){
		worldId = subjectId;
	}
	else if(WIKI_PERMISSIONS.includes(permission)){
		const wiki = await WikiPage.findById(subjectId);
		if(wiki){
			worldId = wiki.world;
		}
	}
	else if(WIKI_FOLDER_PERMISSIONS.includes(permission)){
		const folder = await WikiFolder.findById(subjectId);
		if(folder){
			worldId = folder.world;
		}
	}
	else if(GAME_PERMISSIONS.includes(permission)){
		const game = await Game.findById(subjectId);
		if(game){
			worldId = game.world;
		}
	}

	if(worldId){
		return World.findById(worldId).populate('userPermissionAssignments rolePermissionAssignments');
	}

};