import mongoose from "mongoose";
import {ROLE_ADMIN} from "../../../permission-constants";
import {ALL_USERS, EVERYONE, WORLD_OWNER} from "../../../role-constants";
import {getSubjectFromPermission, userHasPermission} from "../../authorization-helpers";
import {Role} from "../../models/role";
import {World} from "../../models/world";
import {User} from "../../models/user";
import {PermissionAssignment} from "../../models/permission-assignement";

export const authorizationMutations = {
	createRole: async (_, {name, worldId}, {currentUser}) => {

		const newRole = new Role({name, world: worldId});

		if(await newRole.userCanWrite(currentUser)){

			if([WORLD_OWNER, EVERYONE, ALL_USERS].includes(name)){
				throw new Error(`Role name cannot be reserved role name ${name}`);
			}

			const world = await World.findById(worldId).populate('roles');
			if(!world){
				throw new Error("World does not exist");
			}
			await newRole.save();
			return newRole;
		}
		else{
			throw Error(`You do not have the required permission: ${ROLE_ADMIN}`)
		}
	},
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
};