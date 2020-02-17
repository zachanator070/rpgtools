import {authenticated} from "../../authentication-helpers";
import {userHasPermission} from "../../authorization-helpers";
import {
	FOLDER_READ_ALL, FOLDER_RW_ALL, GAME_HOST,
	ROLE_ADMIN,
	WIKI_READ_ALL,
	WIKI_RW_ALL,
	WORLD_CREATE,
	WORLD_READ
} from "../../../permission-constants";
import {World} from "../../models/world";
import {Place} from "../../models/place";
import {WikiFolder} from "../../models/wiki-folder";
import {PermissionAssignment} from "../../models/permission-assignement";
import {Role} from "../../models/role";
import {EVERYONE, WORLD_OWNER} from "../../../role-constants";
import {PLACE} from "../../../wiki-page-types";
import {WikiPage} from "../../models/wiki-page";
import {Pin} from "../../models/pin";

export const worldMutations = {
	createWorld: authenticated(async (parent, {name, public: isPublic}, {currentUser}) => {

		if (!await userHasPermission(currentUser, WORLD_CREATE, null)) {
			throw Error(`You do not have the required permission: ${WORLD_CREATE}`);
		}

		const world = await World.create({name, public: isPublic});
		const rootWiki = await Place.create({name, public: isPublic, world: world._id});
		const rootFolder = await WikiFolder.create({world: world._id, name: name});
		const placeFolder = await WikiFolder.create({world: world._id, name: 'Places', pages: [rootWiki._id]});
		const peopleFolder = await WikiFolder.create({world: world._id, name: 'People'});
		rootFolder.children.push(placeFolder, peopleFolder);
		await rootFolder.save();

		world.rootFolder = rootFolder._id;
		world.wikiPage = rootWiki._id;

		const ownerPermissions = [];
		for (const permission of [ROLE_ADMIN, WORLD_READ, WIKI_READ_ALL, WIKI_RW_ALL, FOLDER_READ_ALL, FOLDER_RW_ALL, GAME_HOST]) {
			const permissionAssignment = await PermissionAssignment.create({
				permission: permission,
				subjectId: world._id
			});
			ownerPermissions.push(permissionAssignment);
		}
		const ownerRole = await Role.create({name: WORLD_OWNER, world: world._id, permissions: ownerPermissions});
		currentUser.roles.push(ownerRole);
		await currentUser.save();

		const everyonePerms = [];
		if (isPublic) {
			const wikiReadAllPermission = await PermissionAssignment.create({
				permission: WIKI_READ_ALL,
				subjectId: world._id
			});

			const folderReadAllPermission = await PermissionAssignment.create({
				permission: FOLDER_READ_ALL,
				subjectId: world._id
			});

			const worldRead = await PermissionAssignment.create({
				permission: WORLD_READ,
				subjectId: world._id
			});
			everyonePerms.push(wikiReadAllPermission, worldRead, folderReadAllPermission);
		}
		const everyoneRole = await Role.create({name: EVERYONE, world: world._id, permissions: everyonePerms});

		world.roles = [everyoneRole._id, ownerRole._id];
		await world.save();

		await world.populate('wikiPage rootFolder roles').execPopulate();

		return world;
	}),
	createPin: async (parent, {mapId, x, y, wikiId}, {currentUser}) => {

		const map = await Place.findById(mapId);
		if(!map){
			throw new Error(`Wiki of type ${PLACE} with id ${mapId} does not exist`);
		}

		const wiki = await WikiPage.findById(wikiId);
		if(!wiki){
			throw new Error(`Wiki with id ${wikiId} does not exist`);
		}

		if(!await map.userCanWrite(currentUser)){
			throw new Error(`You do not have permission to add pins to wiki ${wikiId}`);
		}

		const newPin = await Pin.create({
			map,
			x,
			y,
			page: wiki
		});
		return newPin;
	}
};