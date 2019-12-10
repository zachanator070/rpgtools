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

export const worldResolvers = {
	createWorld: authenticated(async (parent, {name, public: isPublic}, {currentUser}) => {

		if (!await userHasPermission(currentUser, WORLD_CREATE, null)) {
			throw Error(`You do not have the required permission: ${WORLD_CREATE}`);
		}

		const world = await World.create({name, public: isPublic});
		const rootWiki = await Place.create({name, public: isPublic, world: world._id});
		const rootFolder = await WikiFolder.create({world: world._id, name: 'root', pages: [rootWiki._id]});
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

			const worldRead = await PermissionAssignment.create({
				permission: WORLD_READ,
				subjectId: world._id
			});
			everyonePerms.push(wikiReadAllPermission, worldRead);
		}
		const everyoneRole = await Role.create({name: EVERYONE, world: world._id, permissions: everyonePerms});

		world.roles = [everyoneRole._id, ownerRole._id];
		await world.save();

		await world.populate('wikiPage rootFolder roles').execPopulate();

		return world;
	})
};