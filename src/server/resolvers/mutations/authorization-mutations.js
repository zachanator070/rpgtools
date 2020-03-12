import {ROLE_ADD, ROLE_ADMIN} from "../../../permission-constants";
import { userHasPermission} from "../../authorization-helpers";
import {Role} from "../../models/role";
import {World} from "../../models/world";
import {User} from "../../models/user";
import {PermissionAssignment} from "../../models/permission-assignement";
import {cleanUpPermissions} from "../../db-helpers";
import {EVERYONE, WORLD_OWNER} from "../../../role-constants";
import {ROLE} from "../../../type-constants";

export const authorizationMutations = {
	grantUserPermission: async (_, {userId, permission, subjectId, subjectType}, {currentUser}) => {

		let newPermission = await PermissionAssignment.findOne({permission, subject: subjectId}).populate('subject');
		if(!newPermission){
			newPermission = new PermissionAssignment({permission, subject: subjectId, subjectType}).populate('subject');
		}
		if(!await newPermission.userCanWrite(currentUser)){
			throw new Error(`You do not have permission to assign the permission "${permission}" with the subject ${subjectId}`);
		}

		const user = await User.findById(userId).populate('permissions');
		if(!user){
			throw new Error("User does not exist");
		}
		// check if user already has that permission
		for(let userPermission of user.permissions){
			if(userPermission._id.equals(newPermission._id)){
				return newPermission.subject.world;
			}
		}

		await newPermission.save();
		user.permissions.push(newPermission._id);
		await user.save();
		return newPermission.subject;
	},
	revokeUserPermission: async (_, {userId, permissionAssignmentId}, {currentUser}) => {

		const user = await User.findById(userId).populate('permissions');
		if(!user){
			throw new Error("User does not exist");
		}

		let permissionAssignment = await PermissionAssignment.findById(permissionAssignmentId).populate('subject');
		if(permissionAssignment){
			if(!await permissionAssignment.userCanWrite(currentUser)){
				throw new Error(`You do not have permission to revoke the permission "${permissionAssignment.permission}"`);
			}
			user.permissions = user.permissions.filter((userPermission) => ! userPermission._id.equals(permissionAssignment._id));
			await user.save();
		}

		return permissionAssignment.subject;
	},
	grantRolePermission: async (_, {roleId, permission, subjectId, subjectType}, {currentUser}) => {

		let newPermission = await PermissionAssignment.findOne({permission, subject: subjectId}).populate('subject');
		if(!newPermission){
			newPermission = new PermissionAssignment({permission, subjectId, subject: subjectType}).populate('subject');
		}
		if(!await newPermission.userCanWrite(currentUser)){
			throw new Error(`You do not have permission to assign the permission "${permission}" with the subject ${subjectId}`);
		}

		const role = await Role.findById(userId).populate('permissions');
		if(!role){
			throw new Error("User does not exist");
		}
		// check if role already has that permission
		for(let rolePermission of role.permissions){
			if(rolePermission._id.equals(newPermission._id)){
				return newPermission.subject.world;
			}
		}

		await newPermission.save();
		role.permissions.push(newPermission._id);
		await role.save();
		return newPermission.subject;
	},
	revokeRolePermission: async (_, {roleId, permissionAssignmentId}, {currentUser}) => {

		const role = await Role.findById(userId).populate('permissions');
		if(!role){
			throw new Error("User does not exist");
		}

		let permissionAssignment = await PermissionAssignment.findById(permissionAssignmentId).populate('subject');
		if(permissionAssignment){
			if(!await permissionAssignment.userCanWrite(currentUser)){
				throw new Error(`You do not have permission to revoke the permission "${permissionAssignment.permission}"`);
			}
			role.permissions = role.permissions.filter((userPermission) => ! userPermission._id.equals(permissionAssignment._id));
			await role.save();
		}

		return permissionAssignment.subject;
	},
	createRole: async (_, {worldId, name}, {currentUser}) => {
		const world = await World.findById(worldId).populate('roles');
		if(!world){
			throw new Error(`World with id ${worldId} doesn't exist`);
		}
		if(!await userHasPermission(currentUser, ROLE_ADD, worldId)){
			throw new Error(`You do not have permission to add roles to world ${worldId}`);
		}
		const newRole = await Role.create({name, world});
		world.roles.push(newRole);
		await world.save();
		const adminRole = await PermissionAssignment.create({permission: ROLE_ADMIN, subject: newRole._id, subjectType: ROLE});
		currentUser.permissions.push(adminRole);
		await currentUser.save();
		return world;
	},
	deleteRole: async (_, {roleId}, {currentUser}) => {
		const role = await Role.findById(roleId);
		if(!role){
			throw new Error(`Role ${roleId} doesn't exist`);
		}
		if(!await role.userCanWrite(currentUser)){
			throw new Error(`You do not have write permissions for role ${roleId}`);
		}
		if(role.name === WORLD_OWNER || role.name === EVERYONE){
			throw new Error('You cannot delete this role');
		}
		const world = await World.findOne({roles: role._id}).populate('roles');
		world.roles = world.roles.filter((otherRole) => {return !otherRole._id.equals(role._id);});
		await world.save();
		await cleanUpPermissions(role._id);
		await Role.deleteOne({_id: role._id});
		return world;
	},
	addUserRole: async (_, {userId, roleId}, {currentUser}) => {
		const role = await Role.findById(roleId);
		if(!role){
			throw new Error(`Role ${roleId} doesn't exist`);
		}

		const user = await User.findById(userId);
		if(!user){
			throw new Error(`Role ${userId} doesn't exist`);
		}

		if(!await role.userCanWrite(currentUser)){
			throw new Error(`You do not have permission to manage role ${roleId}`);
		}

		user.roles.push(role);
		await user.save();
		await role.populate('world').populate('roles usersWithPermissions').execPopulate();
		return role.world;
	},
	removeUserRole: async (_, {userId, roleId}, {currentUser}) => {
		const role = await Role.findById(roleId);
		if(!role){
			throw new Error(`Role ${roleId} doesn't exist`);
		}

		const user = await User.findById(userId).populate('roles');
		if(!user){
			throw new Error(`Role ${userId} doesn't exist`);
		}

		if(!await role.userCanWrite(currentUser)){
			throw new Error(`You do not have permission to manage role ${roleId}`);
		}

		if(role.name === WORLD_OWNER){
			const otherOwners = await User.find({roles: role._id});
			if(otherOwners.length === 1){
				throw new Error('World must have at least one owner');
			}
		}

		user.roles = user.roles.filter(userRole => !userRole._id.equals(role._id));
		await user.save();
		await role.populate('world').populate('roles usersWithPermissions').execPopulate();
		return role.world;
	}
};