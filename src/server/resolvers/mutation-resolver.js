import bcrypt from 'bcrypt';
import uuidv4 from 'uuid/v4';
import {ACCESS_TOKEN_MAX_AGE, createTokens, REFRESH_TOKEN_MAX_AGE} from "../authentication-helpers";
import {EVERYONE, WORLD_OWNER} from "../../role-constants";
import {Role} from "../models/role";
import {User} from '../models/user';
import {World} from "../models/world";
import {Place} from "../models/place";
import {WikiFolder} from "../models/wiki-folder";
import PermissionAssignment from "../models/permission-assignement";
import {
    GAME_HOST,
    ROLE_ADMIN,
    WIKI_READ_ALL,
    WIKI_WRITE_ALL,
    WORLD_CREATE,
    WORLD_READ
} from "../../permission-constants";
import {userHasPermission} from "../authorization-helpers";

const SALT_ROUNDS = 10;

export default {
	login: async (parent, {username, password}, {res}) => {
		let user = await User.findOne({username}).populate('roles');
		if (user && bcrypt.compareSync(password, user.password)) {
			let tokens = await createTokens(user);
			// expires after 15 min
			res.cookie('accessToken', tokens.accessToken, {expires: new Date(Date.now() + ACCESS_TOKEN_MAX_AGE.ms)});
			// expires after 24 hours
			res.cookie('refreshToken', tokens.refreshToken, {expires: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE.ms)});
			return user;
		}
		throw Error('Login failure: username or password are incorrect');
	},
	logout: async (parent, args, {res, currentUser}) => {
		if (currentUser) {
			res.clearCookie('accessToken');
			res.clearCookie('refreshToken');
			return "success";
		}
		return "failure";
	},
	register: async (parent, {email, username, password}, context) => {
		password = bcrypt.hashSync(password, SALT_ROUNDS);
		let existingUsers = await User.find({email});
		if (existingUsers.length > 1) {
			throw Error('Registration Error: Email already used')
		}
		existingUsers = await User.find({username});
		if (existingUsers.length > 1) {
			throw Error('Registration Error: Username already used')
		}

		const createWorldPermission = await PermissionAssignment.create({permission: WORLD_CREATE, subject: null});

		return await User.create({email, username, password, roles: [], permissions: [createWorldPermission._id]});
	},
	invalidateTokens: async (parent, params, {currentUser}) => {
		if (!currentUser) {
			return false;
		}

		currentUser.version = uuidv4();
		await currentUser.save();

		return true;
	},
	createWorld: async (parent, {name, public: isPublic}, {currentUser}) => {
		if (!currentUser) {
			throw Error('You must be logged in to create a world');
		}

		if (!await userHasPermission(currentUser, WORLD_CREATE, null)) {
			throw Error('You do not have permission to create a world');
		}

		const world = await World.create({name, public: isPublic});
		const rootWiki = await Place.create({name, public: isPublic, world: world._id});
		const rootFolder = await WikiFolder.create({world: world._id, name: 'root', pages: [rootWiki._id]});
		world.rootFolder = rootFolder._id;
		world.wikiPage = rootWiki._id;


		const ownerPermissions = [];
		for (const permission of [ROLE_ADMIN, WORLD_READ, WIKI_READ_ALL, WIKI_WRITE_ALL, GAME_HOST]) {
			const permissionAssignment = await PermissionAssignment.create({
				permission: permission,
				subject: world._id
			});
			ownerPermissions.push(permissionAssignment);
		}
		const ownerRole = await Role.create({name: WORLD_OWNER, world: world._id, permissions: ownerPermissions});
		currentUser.roles.push(ownerRole._id);
		await currentUser.save();

		const everyonePerms = [];
		if (isPublic) {
			const wikiReadAllPermission = await PermissionAssignment.create({
				permission: WIKI_READ_ALL,
				subject: world._id
			});
			everyonePerms.push(wikiReadAllPermission);
		}
		const everyoneRole = await Role.create({name: EVERYONE, world: world._id, permissions: everyonePerms});

		world.roles = [everyoneRole._id, ownerRole._id];
		await world.save();

		return world;
	},
	createRole: async (_, {name, permissions, worldId}, {currentUser}) => {
		if(name === null){
			throw new Error("Name field is required");
		}
		if(worldId === null){
			throw new Error("WorldId field is required");
		}

		permissions = permissions ?? [];

		if(await userHasPermission(currentUser, ROLE_ADMIN, worldId, worldId)){

		}
	}
}