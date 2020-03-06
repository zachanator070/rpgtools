import mongoose from "mongoose";
import {ROLE_ADD, ROLE_ADMIN} from "../../../permission-constants";
import {ALL_USERS, EVERYONE, WORLD_OWNER} from "../../../role-constants";
import {getSubjectFromPermission, userHasPermission} from "../../authorization-helpers";
import {Role} from "../../models/role";
import {World} from "../../models/world";
import {User} from "../../models/user";
import {PermissionAssignment} from "../../models/permission-assignement";
import {cleanUpPermissions} from "../../db-helpers";

export const authorizationMutations = {
	grantUserPermission: async (_, {userId, permission, subjectId}, {currentUser}) => {

		let newPermission = await PermissionAssignment.findOne({permission, subjectId});
		if(!newPermission){
			newPermission = new PermissionAssignment({permission, subjectId});
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
			if(userPermission.permission === permission && userPermission.subjectId.equals(new mongoose.Types.ObjectId(subjectId))){
				return getSubjectFromPermission(permission, subjectId);
			}
		}

		await newPermission.save();
		user.permissions.push(newPermission._id);
		await user.save();
		return getSubjectFromPermission(permission, subjectId);
	},
	revokeUserPermission: async (_, {userId, permission, subjectId}, {currentUser}) => {

		const user = await User.findById(userId).populate('permissions');
		if(!user){
			throw new Error("User does not exist");
		}

		let permissionAssignment = await PermissionAssignment.findOne({permission, subjectId});
		if(permissionAssignment){
			if(!await permissionAssignment.userCanWrite(currentUser)){
				throw new Error(`You do not have permission to revoke the permission "${permission}" with the subject ${subjectId}`);
			}
			user.permissions = user.permissions.filter((userPermission) => userPermission.permission !== permission || ! userPermission.subjectId.equals(new mongoose.Types.ObjectId(subjectId)));
			await user.save();
		}

		return getSubjectFromPermission(permission, subjectId);
	},
	grantRolePermission: async (_, {roleId, permission, subjectId}, {currentUser}) => {

		let newPermission = await PermissionAssignment.findOne({permission, subjectId});
		if(!newPermission){
			newPermission = new PermissionAssignment({permission, subjectId});
		}
		if(!await newPermission.userCanWrite(currentUser)){
			throw new Error(`You do not have permission to assign the permission "${permission}" with the subject ${subjectId}`);
		}

		const role = await Role.findById(roleId).populate('permissions');
		if(!role){
			throw new Error("Role does not exist");
		}
		// check if user already has that permission
		for(let rolePermission of role.permissions){
			if(rolePermission.permission === permission && rolePermission.subjectId.equals(new mongoose.Types.ObjectId(subjectId))){
				return getSubjectFromPermission(permission, subjectId);
			}
		}

		await newPermission.save();
		role.permissions.push(newPermission._id);
		await role.save();
		return getSubjectFromPermission(permission, subjectId);
	},
	revokeRolePermission: async (_, {roleId, permission, subjectId}, {currentUser}) => {

		const role = await Role.findById(roleId).populate('permissions');
		if(!role){
			throw new Error("Role does not exist");
		}

		let permissionAssignment = await PermissionAssignment.findOne({permission, subjectId});
		if(permissionAssignment){
			if(!await permissionAssignment.userCanWrite(currentUser)){
				throw new Error(`You do not have permission to revoke the permission "${permission}" with the subject ${subjectId}`);
			}
			role.permissions = role.permissions.filter((userPermission) => userPermission.permission !== permission || ! userPermission.subjectId.equals(new mongoose.Types.ObjectId(subjectId)));
			await role.save();
		}
		return getSubjectFromPermission(permission, subjectId);
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
		const adminRole = await PermissionAssignment.create({permission: ROLE_ADMIN, subjectId: newRole._id});
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
		const world = await World.findOne({roles: role._id}).populate('roles');
		world.roles = world.roles.filter((otherRole) => {return !otherRole._id.equals(role._id);});
		await world.save();
		await cleanUpPermissions(role._id);
		await Role.deleteOne({_id: role._id});
		return world;
	}
};