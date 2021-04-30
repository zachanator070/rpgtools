import { Role } from "../models/role";
import { WikiFolder } from "../models/wiki-folder";
import { Place } from "../models/place";
import { GAME_HOST, MODEL_ADD, ROLE_ADD } from "../../../common/src/permission-constants";
import { Pin } from "../models/pin";
import { PermissionAssignment } from "../models/permission-assignement";
import { World } from "../models/world";
import { ALL_USERS, EVERYONE } from "../../../common/src/role-constants";
import { User } from "../models/user";
import { Image } from "../models/image";
import { Chunk } from "../models/chunk";
import { WikiPage } from "../models/wiki-page";
import mongoose from "mongoose";
import { Model } from "../models/model";
import { GraphQLUpload } from "graphql-upload";
import { getLoader } from "../get-loader";

const getPermissions = async (document, documentType, currentUser) => {
	const permissions = await PermissionAssignment.find({
		subject: document,
		subjectType: documentType,
	});
	const returnPermissions = [];
	for (let permission of permissions) {
		if (await permission.userCanWrite(currentUser)) {
			returnPermissions.push(permission);
		}
	}
	return returnPermissions;
};

const getDocument = async (model, id) => {
	if (id) {
		return await getLoader(model).load(id);
	}
};

const getDocuments = async (model, ids) => {
	// filter out object ids
	let documents = ids.filter((document) => !(document instanceof mongoose.Types.ObjectId));
	// concat models from object ids
	documents = documents.concat(
		await getLoader(model).loadMany(
			ids.filter((document) => document instanceof mongoose.Types.ObjectId)
		)
	);
	return documents;
};

const getPermissionControlledDocuments = async (model, ids, currentUser) => {
	let documents = [];
	for (let document of await getDocuments(model, ids)) {
		if (await document.userCanRead(currentUser)) {
			documents.push(document);
		}
	}
	return documents;
};

const getPermissionControlledDocument = async (model, id, currentUser) => {
	if (id) {
		const document = id instanceof mongoose.Types.ObjectId ? await getDocument(model, id) : id;
		if (await document.userCanRead(currentUser)) {
			return document;
		}
	}
};

const wikiPageInterfaceAttributes = {
	world: async (page) => {
		return await getDocument(World, page.world);
	},
	folder: async (page) => {
		return WikiFolder.findOne({ pages: page._id });
	},
	coverImage: async (page) => {
		return await getDocument(Image, page.coverImage);
	},
	canWrite: async (page, _, { currentUser }) => {
		return await page.userCanWrite(currentUser);
	},
	canAdmin: async (page, _, { currentUser }) => {
		return await page.userCanAdmin(currentUser);
	},
};

const permissionControlledInterfaceAttributes = {
	accessControlList: async (document, _, { currentUser }) => {
		return await getPermissions(document, document.constructor.modelName, currentUser);
	},
	canWrite: async (document, _, { currentUser }) => {
		return await document.userCanWrite(currentUser);
	},
	canAdmin: async (document, _, { currentUser }) => {
		return await document.userCanAdmin(currentUser);
	},
};

const modeledWikiAttributes = {
	model: async (document, _, { currentUser }) => {
		return await getDocument(Model, document.model);
	},
};

export const TypeResolvers = {
	World: {
		roles: async (world, _, { currentUser }) => {
			return await getPermissionControlledDocuments(Role, world.roles, currentUser);
		},
		rootFolder: async (world, _, { currentUser }) => {
			return await getPermissionControlledDocument(WikiFolder, world.rootFolder, currentUser);
		},
		wikiPage: async (world, _, { currentUser }) => {
			return await getDocument(Place, world.wikiPage);
		},
		canAddRoles: async (world, _, { currentUser }) => {
			return currentUser.hasPermission(ROLE_ADD, world._id);
		},
		canHostGame: async (world, _, { currentUser }) => {
			return currentUser.hasPermission(GAME_HOST, world._id);
		},
		canAddModels: async (world, _, { currentUser }) => {
			return currentUser.hasPermission(MODEL_ADD, world._id);
		},
		pins: async (world, _, { currentUser }) => {
			return await getPermissionControlledDocuments(Pin, world.pins, currentUser);
		},
		...permissionControlledInterfaceAttributes,
	},
	PermissionControlled: {
		__resolveType: async (subject) => {
			return subject.constructor.modelName;
		},
	},
	User: {
		email: async (user, _, { currentUser }) => {
			if (!user._id.equals(currentUser._id)) {
				return "";
			}
			return user.email;
		},
		roles: async (user, _, { currentUser }) => {
			return await getPermissionControlledDocuments(Role, user.roles, currentUser);
		},
		permissions: async (user, _, { currentUser }) => {
			return await getPermissionControlledDocuments(
				PermissionAssignment,
				user.permissions,
				currentUser
			);
		},
		currentWorld: async (user, _, { currentUser }) => {
			if (!user._id.equals(currentUser._id)) {
				return null;
			}
			return getPermissionControlledDocument(World, user.currentWorld, currentUser);
		},
	},
	Role: {
		permissions: async (role, _, { currentUser }) => {
			if (
				role.name === EVERYONE ||
				role.name === ALL_USERS ||
				(await role.userCanWrite(currentUser)) ||
				(await currentUser.hasRole(role))
			) {
				return await getDocuments(PermissionAssignment, role.permissions);
			} else {
				return await getPermissionControlledDocuments(
					PermissionAssignment,
					role.permissions,
					currentUser
				);
			}
		},
		members: async (role, _, { currentUser }) => {
			if (!(await role.userCanWrite(currentUser)) && !(await currentUser.hasRole(role))) {
				return [];
			}
			return User.find({ roles: role._id });
		},
		...permissionControlledInterfaceAttributes,
	},
	WikiPage: {
		__resolveType: async (page) => {
			return page.type;
		},
	},
	Article: {
		...wikiPageInterfaceAttributes,
		...permissionControlledInterfaceAttributes,
	},
	Person: {
		...wikiPageInterfaceAttributes,
		...permissionControlledInterfaceAttributes,
		...modeledWikiAttributes,
	},
	Place: {
		...wikiPageInterfaceAttributes,
		...permissionControlledInterfaceAttributes,
		mapImage: async (page) => {
			return await getDocument(Image, page.mapImage);
		},
	},
	ModeledWiki: {
		__resolveType: async (page) => {
			return page.type;
		},
	},
	Item: {
		...wikiPageInterfaceAttributes,
		...permissionControlledInterfaceAttributes,
		...modeledWikiAttributes,
	},
	Monster: {
		...wikiPageInterfaceAttributes,
		...permissionControlledInterfaceAttributes,
		...modeledWikiAttributes,
	},
	WikiFolder: {
		world: async (page) => {
			return await getDocument(World, page.world);
		},
		children: async (folder, _, { currentUser }) => {
			return await getPermissionControlledDocuments(WikiFolder, folder.children, currentUser);
		},
		...permissionControlledInterfaceAttributes,
	},
	Image: {
		world: async (image) => {
			return await getDocument(World, image.world);
		},
		chunks: async (image) => {
			return await getDocuments(Chunk, image.chunks);
		},
		icon: async (image) => {
			return await getDocument(Image, image.icon);
		},
	},
	Pin: {
		map: async (pin) => {
			return await getDocument(Place, pin.map);
		},
		page: async (pin) => {
			return await getDocument(WikiPage, pin.page);
		},
		canWrite: async (pin, _, { currentUser }) => {
			return await pin.userCanWrite(currentUser);
		},
	},
	ServerConfig: {
		registerCodes: async (server, _, { currentUser }) => {
			if (!currentUser) {
				return [];
			}
			if (!(await server.userCanWrite(currentUser))) {
				return [];
			}
			return server.registerCodes;
		},
		roles: async (server, _, { currentUser }) => {
			const roles = await Role.find({ world: null });
			const returnRoles = [];
			for (let role of roles) {
				if (await role.userCanRead(currentUser)) {
					returnRoles.push(role);
				}
			}
			return returnRoles;
		},
		...permissionControlledInterfaceAttributes,
	},
	PermissionAssignment: {
		subject: async (assignment, _, { currentUser }) => {
			if (assignment.subject instanceof mongoose.Types.ObjectId) {
				await assignment.populate("subject").execPopulate();
			}

			return assignment.subject;
		},
		canWrite: async (assignment, _, { currentUser }) => {
			return await assignment.userCanWrite(currentUser);
		},
		users: async (assignment, _, { currentUser }) => {
			if (!(await assignment.userCanRead(currentUser))) {
				return [];
			}
			return User.find({ permissions: assignment._id });
		},
		roles: async (assignment, _, { currentUser }) => {
			if (!(await assignment.userCanRead(currentUser))) {
				return [];
			}
			return Role.find({ permissions: assignment._id });
		},
	},
	Game: {
		world: async (game, _, { currentUser }) => {
			return await getPermissionControlledDocument(World, game.world, currentUser);
		},
		map: async (game, _, { currentUser }) => {
			return await getDocument(Place, game.map);
		},
		characters: async (game) => {
			const characters = [];
			for (let character of game.characters) {
				characters.push({
					name: character.name,
					color: character.color,
					player: await getDocument(User, character.player),
					str: character.str,
					dex: character.dex,
					con: character.con,
					int: character.int,
					wis: character.wis,
					cha: character.cha,
				});
			}
			return characters;
		},
		models: async (game, _, { currentUser }) => {
			const models = [];
			for (let model of game.models) {
				const modelWiki = model.wiki;
				model = model.toObject();
				model.model = await Model.findById(model.model);
				model.wiki = await getPermissionControlledDocument(WikiPage, modelWiki, currentUser);
				models.push(model);
			}
			return models;
		},
		messages: async (game, _, { currentUser }) => {
			return game.messages.filter(
				(message) => message.receiver === currentUser.username || message.receiver === "all"
			);
		},
		canWriteFog: async (game, _, { currentUser }) => {
			return await game.userCanWriteFog(currentUser);
		},
		canPaint: async (game, _, { currentUser }) => {
			return await game.userCanPaint(currentUser);
		},
		canModel: async (game, _, { currentUser }) => {
			return await game.userCanModel(currentUser);
		},
		...permissionControlledInterfaceAttributes,
	},
	Model: {
		...permissionControlledInterfaceAttributes,
	},
	Upload: GraphQLUpload,
};
