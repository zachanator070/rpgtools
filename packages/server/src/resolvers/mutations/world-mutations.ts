import { authenticated } from "../../authentication-helpers";
import {
	PUBLIC_WORLD_PERMISSIONS,
	WORLD_CREATE,
	WORLD_PERMISSIONS,
} from "../../../../common/src/permission-constants";
import { World } from "../../dal/mongodb/models/world";
import { Place } from "../../dal/mongodb/models/place";
import { WikiFolder } from "../../dal/mongodb/models/wiki-folder";
import { PermissionAssignment } from "../../dal/mongodb/models/permission-assignment";
import { Role } from "../../dal/mongodb/models/role";
import { EVERYONE, WORLD_OWNER } from "../../../../common/src/role-constants";
import { WikiPageModel } from "../../dal/mongodb/models/wiki-page";
import { Pin } from "../../dal/mongodb/models/pin";
import { PLACE, WORLD } from "../../../../common/src/type-constants";
import { ServerConfig } from "../../dal/mongodb/models/server-config";
import { FiveEImporter } from "../../five-e-import/five-e-importer";
import { SessionContext } from "../../types";

type createWorldArgs = {
	name: string;
	public: boolean;
};

export const worldMutations = {
	createWorld: async (
		_: any,
		{ name, public: isPublic }: createWorldArgs,
		{ currentUser }: SessionContext
	) => {},

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

		const wiki = await WikiPageModel.findById(wikiId);

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
			page = await WikiPageModel.findById(pageId);
			if (!page) {
				throw new Error(`Wiki page does not exist for id ${pageId}`);
			}
		}

		pin.page = page;
		await pin.save();
		await pin.populate({ path: "map", populate: { path: "world" } }).execPopulate();
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

		await pin.populate({ path: "map", populate: { path: "world" } }).execPopulate();
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
		{
			worldId,
			creatureCodex,
			tomeOfBeasts,
		}: { worldId: string; creatureCodex: boolean; tomeOfBeasts: boolean },
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

		return world;
	},
};
