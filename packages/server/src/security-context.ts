import { PermissionAssignment } from "./domain-entities/permission-assignment";
import { Role } from "./domain-entities/role";
import { User } from "./domain-entities/user";

export class SecurityContext {
	permissions: PermissionAssignment[];
	roles: Role[];
	user: User;

	constructor(user: User, permissions: PermissionAssignment[], roles: Role[]) {
		this.user = user;
		this.permissions = permissions;
		this.roles = roles;
	}

	hasPermission = (permission: string, subjectId?: string): boolean => {
		for (let assignment of this.permissions) {
			if (assignment.permission === permission) {
				if (subjectId) {
					return assignment.subjectId === subjectId;
				} else {
					return true;
				}
			}
		}
	};

	hasRole = (name: string) => {
		for (let role of this.roles) {
			if (role.name === name) {
				return true;
			}
		}
		return false;
	};
}
