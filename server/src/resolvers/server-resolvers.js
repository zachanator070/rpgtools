import QueryResolver from "./query-resolver";
import MutationResolver from "./mutation-resolver";
import {WikiFolder} from "../models/wiki-folder";
import {PermissionAssignment} from "../models/permission-assignement";
import {User} from "../models/user";
import {
	GAME_HOST, GAME_WRITE,
	ROLE_ADD,
	ROLE_PERMISSIONS,
	WIKI_FOLDER_PERMISSIONS,
	WIKI_PERMISSIONS,
	WORLD_PERMISSIONS
} from "../../../common/src/permission-constants";
import {ALL_USERS, EVERYONE} from "../../../common/src/role-constants";
import {getLoader} from "../get-loader";
import {WikiPage} from "../models/wiki-page";
import mongoose from 'mongoose';
import {Role} from "../models/role";
import {Pin} from "../models/pin";
import {World} from "../models/world";
import {Chunk} from "../models/chunk";
import {Place} from "../models/place";
import {Image} from "../models/image";

const usersWithPermissions = (permissionSet) => async (subject, _, {currentUser}) => {
	let allUsers = [];
	for(let permission of permissionSet){
		let assignment = await PermissionAssignment.findOne({permission: permission, subject: subject._id});
		if(!assignment){
			continue;
		}
		if(!await assignment.userCanRead(currentUser)){
			continue;
		}
		const users = await User.find({permissions: assignment._id}).populate({
			path: 'permissions',
			populate: {
				path: 'subject'
			}
		});
		allUsers = allUsers.concat(users);
	}
	return allUsers;
};

const getDocument = async (model, id) => {
	if(id){
		return await getLoader(model).load(id);
	}

}

const getDocuments = async (model, ids) => {
	// filter out object ids
	let documents = ids.filter(document => ! (document instanceof mongoose.Types.ObjectId));
	// concat models from object ids
	documents = documents.concat(await getLoader(model).loadMany(ids.filter(document => document instanceof mongoose.Types.ObjectId)));
	return documents;
}

const getPermissionControlledDocuments = async (model, ids, currentUser) => {
	let documents = [];
	for(let document of await getDocuments(model, ids)){
		if(await document.userCanRead(currentUser)){
			documents.push(document);
		}
	}
	return documents;
};

const getPermissionControlledDocument = async (model, id, currentUser) => {
	if(id){
		const document = id instanceof mongoose.Types.ObjectId ? await getDocument(model, id) : id;
		if(await document.userCanRead(currentUser)){
			return document;
		}
	}
};

const wikiPageResolvers = {
	world: async (page) => {
		return await getDocument(World, page.world);
	},
	coverImage: async (page) => {
		return await getDocument(Image, page.coverImage);
	},
	canWrite: async (page, _, {currentUser}) => {
		return await page.userCanWrite(currentUser);
	},
	usersWithPermissions: usersWithPermissions(WIKI_PERMISSIONS)
};

export const serverResolvers = {
	Query: QueryResolver,
	Mutation: MutationResolver,
	World: {
		roles: async (world, _, {currentUser}) => {
			return await getPermissionControlledDocuments(Role, world.roles, currentUser);
		},
		rootFolder: async (world, _, {currentUser}) => {
			return await getPermissionControlledDocument(WikiFolder, world.rootFolder, currentUser);
		},
		wikiPage: async (world, _, {currentUser}) => {
			return await getPermissionControlledDocument(Place, world.wikiPage, currentUser);
		},
		canWrite: async (world, _, {currentUser}) => {
			return await world.userCanWrite(currentUser);
		},
		pins: async (world, _, {currentUser}) => {
			return await getPermissionControlledDocuments(Pin, world.pins, currentUser);
		},
		folders: async (world, _, {currentUser}) => {
			const folders = [];
			for(let folder of await WikiFolder.find({world: world._id})){
				if(await folder.userCanRead(currentUser)){
					folders.push(folder);
				}
			}
			return folders;
		},
		usersWithPermissions: usersWithPermissions(WORLD_PERMISSIONS),
		canAddRoles: async (world, _, {currentUser}) => {
			return currentUser.hasPermission(ROLE_ADD, world._id);
		},
		canHostGame: async (world, _, {currentUser}) => {
			return currentUser.hasPermission(GAME_HOST, world._id);
		},
	},
	PermissionControlled: {
		__resolveType: async (subject) => {
			return subject.constructor.modelName;
		},
	},
	User: {
		email: async (user, _, {currentUser}) => {
			if(!user._id.equals(currentUser._id)){
				return '';
			}
			return user.email;
		},
		roles: async (user, _, {currentUser}) => {
			return await getPermissionControlledDocuments(Role, user.roles, currentUser);
		},
		permissions: async (user, _, {currentUser}) => {
			return await getPermissionControlledDocuments(PermissionAssignment, user.permissions, currentUser);
		},
		currentWorld: async (user, _, {currentUser}) => {
			if(!user._id.equals(currentUser._id)){
				return null;
			}
			return getPermissionControlledDocument(World, user.currentWorld, currentUser);
		}
	},
	Role: {
		permissions: async (role, _, {currentUser}) => {
			if(role.name === EVERYONE || role.name === ALL_USERS){
				return await getDocuments(PermissionAssignment, role.permissions);
			}
			else {
				return await getPermissionControlledDocuments(PermissionAssignment, role.permissions, currentUser);
			}
		},
		canWrite: async (role, _, {currentUser}) => {
			return role.userCanWrite(currentUser);
		},
		members: async (role, _, {currentUser}) => {

			if(! await role.userCanWrite(currentUser)){
				return [];
			}
			return User.find({roles: role._id});
		},
		usersWithPermissions: usersWithPermissions(ROLE_PERMISSIONS)
	},
	WikiPage: {
		__resolveType: async (page) => {
			return page.type;
		},
	},
	Article: {
		...wikiPageResolvers,
	},
	Person: {
		...wikiPageResolvers,
	},
	Place: {
		...wikiPageResolvers,
		mapImage: async (page) => {
			return await getDocument(Image, page.mapImage);
		}
	},
	WikiFolder: {
		world: async (page) => {
			return await getDocument(World, page.world);
		},
		children: async (folder, _, {currentUser}) => {
			return await getPermissionControlledDocuments(WikiFolder, folder.children, currentUser);
		},
		pages: async (folder, _, {currentUser}) => {
			return await getPermissionControlledDocuments(WikiPage, folder.pages, currentUser);
		},
		canWrite: async (folder, _, {currentUser}) => {
			return await folder.userCanWrite(currentUser);
		},
		usersWithPermissions: usersWithPermissions(WIKI_FOLDER_PERMISSIONS)
	},
	Image: {
		world: async (image) => {
			return await getDocument(World, image.world);
		},
		chunks: async (image) => {
			return await getDocuments(Chunk, image.chunks);
		},
		icon: async (image) => {
			return await getDocument(Image, image.icon)
		},
		canWrite: async (image, _, {currentUser}) => {
			return await image.userCanWrite(currentUser);
		},
	},
	Pin: {
		map: async (pin) => {
			return await getDocument(Place, pin.map);
		},
		page: async (pin) => {
			return await getDocument(WikiPage, pin.page);
		},
		canWrite: async (pin, _, {currentUser}) => {
			return await pin.userCanWrite(currentUser);
		}
	},
	ServerConfig: {
		registerCodes: async (server, _, {currentUser}) => {
			if(!currentUser){
				return [];
			}
			if(!server.adminUsers.includes(currentUser._id)){
				return [];
			}
			return server.registerCodes;
		},
		adminUsers: async (server, _, {currentUser}) => {
			if(!currentUser){
				return [];
			}
			if(!server.adminUsers.includes(currentUser._id)){
				return [];
			}
			await server.populate('adminUsers').execPopulate();
			return server.adminUsers;
		}
	},
	PermissionAssignment: {
		subject: async (assigment, _, {currentUser}) => {
			if(assigment.subject instanceof mongoose.Types.ObjectId){
				await assigment.populate('subject').execPopulate();
			}
			if(!await assigment.subject.userCanRead(currentUser)){
				assigment.subject = null;
			}
			return assigment.subject;
		},
		canWrite: async (assignment, _, {currentUser}) => {
			return await assignment.userCanWrite(currentUser);
		}
	},
	Game: {
		world: async (game, _, {currentUser}) => {
			return await getPermissionControlledDocument(World, game.world, currentUser);
		},
		map: async (game, _, {currentUser}) => {
			return await getPermissionControlledDocument(Place, game.map, currentUser);
		},
		players: async (game) => {
			return await getDocuments(User, game.players);
		},
		canWrite: async (game, {currentUser}) => {
			return await game.userCanWrite(currentUser);
		}
	}
};