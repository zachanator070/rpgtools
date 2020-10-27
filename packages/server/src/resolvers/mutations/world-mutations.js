import { authenticated } from "../../authentication-helpers";
import {
	PUBLIC_WORLD_PERMISSIONS,
	WORLD_CREATE,
	WORLD_PERMISSIONS,
} from "@rpgtools/common/src/permission-constants";
import { World } from "../../models/world";
import { Place } from "../../models/place";
import { WikiFolder } from "../../models/wiki-folder";
import { PermissionAssignment } from "../../models/permission-assignement";
import { Role } from "../../models/role";
import { EVERYONE, WORLD_OWNER } from "@rpgtools/common/src/role-constants";
import { WikiPage } from "../../models/wiki-page";
import { Pin } from "../../models/pin";
import { PLACE, WORLD } from "@rpgtools/common/src/type-constants";
import { ServerConfig } from "../../models/server-config";
import { FiveEImporter } from "../../fiveEImport/five-e-importer";

export const createWorld = async (name, isPublic, currentUser) => {
	const world = await World.create({ name, public: isPublic });
	const rootWiki = await Place.create({
		name,
		public: isPublic,
		world: world._id,
	});
	const rootFolder = await WikiFolder.create({ world: world._id, name: name });
	const placeFolder = await WikiFolder.create({
		world: world._id,
		name: "Places",
		pages: [rootWiki._id],
	});
	const peopleFolder = await WikiFolder.create({
		world: world._id,
		name: "People",
	});
	rootFolder.children.push(placeFolder, peopleFolder);
	await rootFolder.save();

	world.rootFolder = rootFolder._id;
	world.wikiPage = rootWiki._id;

	const ownerPermissions = [];
	for (const permission of WORLD_PERMISSIONS) {
		let permissionAssignment = await PermissionAssignment.findOne({
			permission: permission,
			subject: world._id,
			subjectType: WORLD,
		});
		if (!permissionAssignment) {
			permissionAssignment = await PermissionAssignment.create({
				permission: permission,
				subject: world._id,
				subjectType: WORLD,
			});
		}
		ownerPermissions.push(permissionAssignment);
	}
	const ownerRole = await Role.create({
		name: WORLD_OWNER,
		world: world._id,
		permissions: ownerPermissions,
	});
	currentUser.roles.push(ownerRole);
	await currentUser.save();

	const everyonePerms = [];
	if (isPublic) {
		for (let permission of PUBLIC_WORLD_PERMISSIONS) {
			let permissionAssignment = await PermissionAssignment.findOne({
				permission: permission,
				subject: world._id,
				subjectType: WORLD,
			});
			if (!permissionAssignment) {
				permissionAssignment = await PermissionAssignment.create({
					permission: permission,
					subject: world._id,
					subjectType: WORLD,
				});
			}
			everyonePerms.push(permissionAssignment);
		}
	}
	const everyoneRole = await Role.create({
		name: EVERYONE,
		world: world._id,
		permissions: everyonePerms,
	});

	world.roles = [ownerRole, everyoneRole];
	await world.save();

	await currentUser.recalculateAllPermissions();

	await world.populate("wikiPage").execPopulate();
	return world;
};

export const worldMutations = {
	createWorld: authenticated(
		async (parent, { name, public: isPublic }, { currentUser }) => {
			const server = await ServerConfig.findOne();
			if (!server) {
				throw new Error("Server config doesnt exist!");
			}
			if (!(await currentUser.hasPermission(WORLD_CREATE, server._id))) {
				throw Error(`You do not have the required permission: ${WORLD_CREATE}`);
			}

			return createWorld(name, isPublic, currentUser);
		}
	),
	renameWorld: async (_, { worldId, newName }, { currentUser }) => {
		const world = await World.findById(worldId);
		if (!world) {
			throw new Error(`World with id ${worldId} doesn't exist`);
		}
		if (!(await world.userCanWrite(currentUser))) {
			throw new Error("You do not have permission to rename this world");
		}
		world.name = newName;
		await world.save();
		return world;
	},
	createPin: async (parent, { mapId, x, y, wikiId }, { currentUser }) => {
		const map = await Place.findById(mapId);
		if (!map) {
			throw new Error(`Wiki of type ${PLACE} with id ${mapId} does not exist`);
		}

		const wiki = await WikiPage.findById(wikiId);

		if (!(await map.userCanWrite(currentUser))) {
			throw new Error(`You do not have permission to add pins to this map`);
		}

		const newPin = await Pin.create({
			map,
			x,
			y,
			page: wiki,
		});
		await map.populate("world").execPopulate();
		const world = map.world;
		world.pins.push(newPin);
		await world.save();
		await world
			.populate({
				path: "pins",
				populate: {
					path: "page map",
				},
			})
			.execPopulate();
		return world;
	},
	updatePin: async (_, { pinId, pageId }, { currentUser }) => {
		const pin = await Pin.findById(pinId);
		if (!pin) {
			throw new Error(`Pin ${pinId} does not exist`);
		}

		if (!(await pin.userCanRead(currentUser))) {
			throw new Error(`You do not have permission to update this pin`);
		}

		let page = null;
		if (pageId) {
			page = await WikiPage.findById(pageId);
			if (!page) {
				throw new Error(`Wiki page does not exist for id ${pageId}`);
			}
		}

		pin.page = page;
		await pin.save();
		await pin
			.populate({ path: "map", populate: { path: "world" } })
			.execPopulate();
		const world = pin.map.world;
		await world
			.populate({
				path: "pins",
				populate: {
					path: "page map",
				},
			})
			.execPopulate();
		return world;
	},
	deletePin: async (_, { pinId }, { currentUser }) => {
		const pin = await Pin.findById(pinId);
		if (!pin) {
			throw new Error(`Pin ${pinId} does not exist`);
		}

		if (!(await pin.userCanRead(currentUser))) {
			throw new Error(`You do not have permission to delete this pin`);
		}

		await pin
			.populate({ path: "map", populate: { path: "world" } })
			.execPopulate();
		const world = pin.map.world;
		await pin.delete();
		await world
			.populate({
				path: "pins",
				populate: {
					path: "page map",
				},
			})
			.execPopulate();
		return world;
	},
	load5eContent: async (
		_,
		{ worldId, creatureCodex, tomeOfBeasts },
		{ currentUser }
	) => {
		const world = await World.findById(worldId).populate("rootFolder");
		if (!world) {
			throw new Error("World does not exist");
		}
		if (!(await world.rootFolder.userCanWrite(currentUser))) {
			throw new Error("You do not have permission to add a top level folder");
		}
		const topFolder = await WikiFolder.create({ name: "5e", world });
		world.rootFolder.children.push(topFolder);
		await world.rootFolder.save();

		const importer = new FiveEImporter(world);

		// have to do these in series before import b/c of race condition where rootFolder.save was throwing ParallelSaveError
		const monsterFolder = await importer.createSubFolder(topFolder, "Monsters");
		const racesFolder = await importer.createSubFolder(topFolder, "Races");
		const classesFolder = await importer.createSubFolder(topFolder, "Classes");
		const spellsFolder = await importer.createSubFolder(topFolder, "Spells");

		await Promise.all([
			importer.importMonsters(monsterFolder, creatureCodex, tomeOfBeasts),
			importer.importAdventurePages(topFolder),
			importer.importRaces(racesFolder),
			(async () => {
				await importer.importSpells(spellsFolder);
				// spells are required to be populated before classes can be imported
				await importer.importClasses(classesFolder, world);
			})(),
		]).catch((err) => {
			console.warn(err);
		});

		return world;
	},
};
