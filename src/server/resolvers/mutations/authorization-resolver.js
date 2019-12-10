import mongoose from "mongoose";
import {ROLE_ADMIN} from "../../../permission-constants";
import {ALL_USERS, EVERYONE, WORLD_OWNER} from "../../../role-constants";
import {userHasPermission} from "../../authorization-helpers";
import {Role} from "../../models/role";
import {World} from "../../models/world";
import {User} from "../../models/user";
import {PermissionAssignment} from "../../models/permission-assignement";

export const authorizationResolver = {
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
			world.roles.push(newRole._id);
			await world.save();
			return newRole;
		}
		else{
			throw Error(`You do not have the required permission: ${ROLE_ADMIN}`)
		}
	},
	setRolePermissions: async (_, {roleId, permissions}, {currentUser}) => {

		const role = await Role.findById(roleId);
		if(!role){
			throw new Error('Role does not exist');
		}

		if(!await role.userCanWrite(currentUser)){
			throw new Error(`You do not have the required permission: ${ROLE_ADMIN}`);
		}

		const newPermissions = [];

		for(let rolePermission of role.permissions){
			let found = false;
			for(let requestedPermission of permissions){
				if(rolePermission.permission === requestedPermission.permission && rolePermission.subjectId.equals(new mongoose.Types.ObjectId(requestedPermission.subjectId))){
					found = true;
				}
			}
			if(!found){
				if(!await rolePermission.userCanWrite(currentUser)){
					throw new Error(`You do not have administrative rights for the permission ${rolePermission.permission} for subject ${rolePermission.subjectId}`);
				}
				await rolePermission.remove();
			}
			else{
				newPermissions.push(rolePermission);
			}
		}


		for (let requestedPermission of permissions) {
			let found = false;
			for (let rolePermission of role.permissions) {
				if(rolePermission.permission === requestedPermission.permission && rolePermission.subjectId.equals(new mongoose.Types.ObjectId(requestedPermission.subjectId))){
					found = true;
				}
			}
			if(!found){
				const newPermission = new PermissionAssignment({...requestedPermission});
				if(!await newPermission.userCanWrite(currentUser)){
					throw new Error(`You do not have administrative rights for the permission ${newPermission.permission} for subject ${newPermission.subjectId}`);
				}
				await newPermission.save();
				newPermissions.push(newPermission);
			}
		}

		role.permissions = newPermissions;
		return await role.save();
	},
	giveUserPermission: async (_, {userId, requestedPermission}, {currentUser}) => {

		const newPermission = new PermissionAssignment({...requestedPermission});

		if(!await newPermission.userCanWrite(currentUser)){
			throw new Error(`You do not have permission to assign the permission "${requestedPermission.permission}" with the subject ${requestedPermission.subjectId}`);
		}

		const user = await User.findById(userId).populate('permissions');
		if(!user){
			throw new Error("User does not exist");
		}
		// check if user already has that permission
		for(let userPermission of user.permissions){
			if(userPermission.permission === requestedPermission.permission && userPermission.subjectId.equals(new mongoose.Types.ObjectId(requestedPermission.subjectId))){
				return userPermission;
			}
		}

		await newPermission.save();
		user.permissions.push(newPermission._id);
		await user.save();
		return newPermission;
	},
	revokeUserPermission: async (_, {userId, requestedPermission}, {currentUser}) => {

		const user = await User.findById(userId).populate('permissions');
		if(!user){
			throw new Error("User does not exist");
		}

		let foundPermission = null;

		// check if user already has that permission
		for(let userPermission of user.permissions){
			if(userPermission.permission === requestedPermission.permission && userPermission.subjectId.equals(new mongoose.Types.ObjectId(requestedPermission.subjectId))){
				foundPermission = userPermission;
			}
		}
		if(foundPermission){
			if(!await foundPermission.userCanWrite(currentUser)){
				throw new Error(`You do not have permission to assign the permission "${requestedPermission.permission}" with the subject ${requestedPermission.subjectId}`);
			}
			await foundPermission.remove();
		}
		else {
			throw new Error('User does not have that permission');
		}
		return foundPermission;
	}
};