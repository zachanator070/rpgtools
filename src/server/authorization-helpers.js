import {Role} from './models/role';
import {EVERYONE} from "../role-constants";

export const userHasPermission = async function (user, permission, subjectId = null, worldId = null) {

	// first check direct assignment
	if (user) {
		for (const userPermission of user.permissions) {
			if (userPermission.permission === permission && userPermission.subject ? userPermission.subject.toString() === subjectId : userPermission.subject === subjectId) {
				return true;
			}
		}
	}

	const userRoles = user ? user.roles : [];

	// get permissions for everyone in the world
	const everyoneRole = await Role.findOne({name: EVERYONE, world: worldId}).populate({path: 'permissions'});
	if (everyoneRole) {
		userRoles.push(everyoneRole);
	}

	// next check roles
	for (const role of userRoles) {
		// first check direct assignment
		for (const rolePermission of role.permissions) {
			if (rolePermission.permission === permission && rolePermission.subject ? rolePermission.subject.toString() === subjectId : rolePermission.subject === subjectId) {
				return true;
			}
		}
	}

	return false;
};