import { World } from "../models/world";
import { User } from "../models/user";
import { ANON_USERNAME } from "@rpgtools/common/src/permission-constants";
import { WikiPage } from "../models/wiki-page";
import { Place } from "../models/place";
import {
	ALL_WIKI_TYPES,
	GAME,
	ITEM,
	MONSTER,
	PERSON,
	PLACE,
	ROLE,
	SERVER_CONFIG,
	WIKI_FOLDER,
	WORLD,
} from "@rpgtools/common/src/type-constants";
import { ServerConfig } from "../models/server-config";
import { Game } from "../models/game";
import { Model } from "../models/model";
import { WikiFolder } from "../models/wiki-folder";
import { Role } from "../models/role";
import { Person } from "../models/person";
import { Monster } from "../models/monster";
import { Item } from "../models/item";

export default {
	currentUser: (parent, args, context) => context.currentUser,
	serverConfig: async () => {
		return ServerConfig.findOne();
	},
	world: async (parent, { worldId }, { currentUser }) => {
		const world = await World.findOne({ _id: worldId });

		if (!world) {
			return null;
		}
		if (!(await world.userCanRead(currentUser))) {
			return null;
		}

		return world;
	},
	worlds: async (_, { canAdmin, page }, { currentUser }) => {
		const results = await World.paginate();
		const docs = [];
		for (let world of results.docs) {
			if (canAdmin !== undefined && !(await world.userCanAdmin(currentUser))) {
				continue;
			}
			if (await world.userCanRead(currentUser)) {
				docs.push(world);
			}
		}
		results.docs = docs;
		return results;
	},
	wiki: async (_, { wikiId }, { currentUser }) => {
		let foundWiki = await WikiPage.findOne({ _id: wikiId });
		if (foundWiki && !(await foundWiki.userCanRead(currentUser))) {
			throw new Error(`You do not have permission to read wiki ${wikiId}`);
		}
		switch (foundWiki.type) {
			case PLACE:
				foundWiki = await Place.findById(wikiId).populate(
					"mapImage coverImage"
				);
				break;
			case PERSON:
				foundWiki = await Person.findById(wikiId).populate("model");
				break;
			case ITEM:
				foundWiki = await Item.findById(wikiId).populate("model");
				break;
			case MONSTER:
				foundWiki = await Monster.findById(wikiId).populate("model");
				break;
		}
		return foundWiki;
	},
	users: async (_, { username }) => {
		return User.paginate({
			username: { $regex: `^${username}.*`, $options: "i" },
		});
	},
	game: async (_, { gameId }, { currentUser }) => {
		const foundGame = await Game.findById(gameId);
		if (foundGame && !(await foundGame.userCanRead(currentUser))) {
			throw new Error("You do not have permission to read this game");
		}
		return foundGame;
	},
	myGames: async (_, __, { currentUser }) => {
		if (currentUser.username === ANON_USERNAME) {
			return [];
		}
		return Game.find({ "characters.player": currentUser._id });
	},
	models: async (_, { worldId }, { currentUser }) => {
		const models = await Model.find({ world: worldId });
		const returnModels = [];
		for (let model of models) {
			if (await model.userCanRead(currentUser)) {
				returnModels.push(model);
			}
		}
		return returnModels;
	},
	myPermissions: async (_, { worldId }, { currentUser }) => {
		const world = await World.findById(worldId);
		if (!world) {
			throw new Error(`World with id ${worldId} does not exist`);
		}

		if (!(await world.userCanRead(currentUser))) {
			throw new Error("You do not have permission to read this world");
		}

		const permissions = [];
		const folders = await WikiFolder.find({ world }).populate("pages");
		const roles = await Role.find({ world });
		for (let permission of currentUser.allPermissions) {
			const subjectId = permission.subject._id;
			const subjectType = permission.subjectType;
			let keepPermission = false;
			if (subjectType === WORLD && subjectId.equals(world._id)) {
				keepPermission = true;
			} else if (subjectType === WIKI_FOLDER) {
				for (let folder of folders) {
					if (folder._id.equals(subjectId)) {
						keepPermission = true;
						break;
					}
				}
			} else if (ALL_WIKI_TYPES.includes(subjectType)) {
				for (let folder of folders) {
					for (let page of folder.pages) {
						if (page.equals(subjectId)) {
							keepPermission = true;
							break;
						}
					}
				}
			} else if (subjectType === ROLE) {
				for (let role of roles) {
					if (role._id.equals(subjectId)) {
						keepPermission = true;
						break;
					}
				}
			} else if (subjectType === SERVER_CONFIG) {
				keepPermission = true;
			} else if (subjectType === GAME) {
				keepPermission = true;
			}
			if (keepPermission) {
				permissions.push(permission);
			}
		}
		return permissions;
	},
	wikisInFolder: async (_, { folderId, page = 1 }, { currentUser }) => {
		const folder = await WikiFolder.findById(folderId);
		if (!folder) {
			throw new Error("Folder does not exist");
		}
		if (!(await folder.userCanRead(currentUser))) {
			throw new Error("You do not have permission to read this folder");
		}
		const results = await WikiPage.paginate(
			{ _id: { $in: folder.pages } },
			{ sort: {name: 1}, page }
		);
		const docs = [];
		for (let doc of results.docs) {
			if (await doc.userCanRead(currentUser)) {
				docs.push(doc);
			}
		}
		results.docs = docs;
		return results;
	},
	wikis: async (_, { worldId, name, types, canAdmin }, { currentUser }) => {
		const world = await World.findById(worldId);
		if (!world) {
			throw new Error("World does not exist");
		}
		if (!(await world.userCanRead(currentUser))) {
			throw new Error("You do not have permission to read this World");
		}

		const conditions = { world: world._id };
		if (name) {
			conditions.name = { $regex: name, $options: "i" };
		}
		if (types && types.length > 0) {
			conditions.type = { $in: types };
		}
		const results = await WikiPage.paginate(conditions);

		const docs = [];
		for (let doc of results.docs) {
			if (canAdmin !== undefined && !(await doc.userCanAdmin(currentUser))) {
				continue;
			}
			if (await doc.userCanRead(currentUser)) {
				docs.push(doc);
			}
		}
		results.docs = docs;
		return results;
	},
	folders: async (_, { worldId, name, canAdmin }, { currentUser }) => {
		const world = await World.findById(worldId);
		if (!world) {
			throw new Error("World does not exist");
		}
		if (!(await world.userCanRead(currentUser))) {
			throw new Error("You do not have permission to read this World");
		}

		const conditions = { world: world._id };
		if (name) {
			conditions.name = { $regex: name, $options: "i" };
		}

		const results = await WikiFolder.find(conditions);

		const docs = [];
		for (let doc of results) {
			if (canAdmin !== undefined && !(await doc.userCanAdmin(currentUser))) {
				continue;
			}
			if (await doc.userCanRead(currentUser)) {
				docs.push(doc);
			}
		}
		return docs;
	},
	roles: async (_, { worldId, name, canAdmin }, { currentUser }) => {
		const world = await World.findById(worldId);
		if (!world) {
			throw new Error("World does not exist");
		}
		if (!(await world.userCanRead(currentUser))) {
			throw new Error("You do not have permission to read this World");
		}

		const conditions = { world: world._id };
		if (name) {
			conditions.name = { $regex: name, $options: "i" };
		}

		const results = await Role.paginate(conditions);

		const docs = [];
		for (let doc of results.docs) {
			if (canAdmin !== undefined && !(await doc.userCanAdmin(currentUser))) {
				continue;
			}
			if (await doc.userCanRead(currentUser)) {
				docs.push(doc);
			}
		}
		results.docs = docs;
		return results;
	},
	getFolderPath: async (_, { wikiId }, { currentUser }) => {
		const path = [];
		let folder = await WikiFolder.findOne({ pages: wikiId });
		while (folder) {
			path.push(folder);
			folder = await WikiFolder.findOne({ children: folder._id });
		}
		return path;
	},
};
