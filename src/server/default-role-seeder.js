
import {Role} from './models/role';
import {PermissionAssignment} from './models/permission-assignement';
import {ALL_USERS} from "../role-constants";
import {WORLD_CREATE} from "../permission-constants";

export const seedDefaultRoles = async () => {
	let allUsersRole = await Role.find({name: ALL_USERS});
	if(allUsersRole.length === 0){
		allUsersRole = await Role.create({name: ALL_USERS});
		const createWorldPermissions = await PermissionAssignment.create({permission: WORLD_CREATE, subjectId: null});
		allUsersRole.permissions.push(createWorldPermissions._id);
		await allUsersRole.save();
		console.log(`Created default role "${ALL_USERS}"`);
	}
};