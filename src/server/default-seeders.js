
import {Role} from './models/role';
import {PermissionAssignment} from './models/permission-assignement';
import {ALL_USERS} from "../role-constants";
import {WORLD_CREATE} from "../permission-constants";
import {Server} from './models/server';
import {SERVER} from "../type-constants";

export const seedDefaultRoles = async () => {
	let allUsersRole = await Role.find({name: ALL_USERS});
	if(allUsersRole.length === 0){
		const server = await Server.findOne();
		if(!server){
			throw new Error('Server needs to exist!');
		}
		allUsersRole = await Role.create({name: ALL_USERS});
		const createWorldPermissions = await PermissionAssignment.create({permission: WORLD_CREATE, subject: server._id, subjectType: SERVER});
		allUsersRole.permissions.push(createWorldPermissions._id);
		await allUsersRole.save();
		console.log(`Created default role "${ALL_USERS}"`);
	}
};

export const seedServer = async () => {
	const server = await Server.findOne();
	if(!server){
		await Server.create({});
		console.log(`Created server config ${server._id}`);
	}
};

export const defaultSeeders = async () => {
	await seedServer();
	await seedDefaultRoles();

};