import {ALL_USERS, EVERYONE} from "../role-constants";
import mongoose from 'mongoose';
import {Role} from './models/role';
import {PermissionAssignment} from "./models/permission-assignement";
import {WORLD} from "../type-constants";


export const userHasPermission = async function (user, permission, subjectId) {
	if(subjectId instanceof String){
		subjectId = new mongoose.Types.ObjectId(subjectId);
	}

	if(subjectId instanceof mongoose.Model){
		subjectId = subjectId._id;
	}

	const assignment = await PermissionAssignment.findOne({permission, subject: subjectId}).populate({
		path: 'subject',
		populate:{
			path: 'world'
		}
	});
	if(!assignment){
		return false;
	}

	// first check direct assignment
	if (user) {
		for (const userPermission of user.permissions) {
			if (userPermission._id.equals(assignment._id)) {
				return true;
			}
		}
	}

	const userRoles = user ? [...user.roles] : [];

	// add "All Users" default role to be checked
	const allUsersRole = await Role.findOne({name: ALL_USERS});
	if(allUsersRole){
		userRoles.push(allUsersRole);
	}

	if(assignment.subjectType === WORLD){
		const everyoneRole = await Role.findOne({name: EVERYONE, world: assignment.subject._id});
		if (everyoneRole) {
			userRoles.push(everyoneRole);
		}
	}
	else if(assignment.subject.world){
		// add "Everyone" default role assigned to world to be checked
		const everyoneRole = await Role.findOne({name: EVERYONE, world: assignment.subject.world._id});
		if (everyoneRole) {
			userRoles.push(everyoneRole);
		}
	}

	// next check all roles assigned to user for permission
	for (const role of userRoles) {
		// first check direct assignment
		for (const rolePermission of role.permissions) {
			if (rolePermission._id.equals(assignment._id)) {
				return true;
			}
		}
	}

	return false;
};
