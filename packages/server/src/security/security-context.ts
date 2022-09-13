import { Role } from "../domain-entities/role";
import { User } from "../domain-entities/user";
import {PermissionControlledEntity} from "../types";
import {ROLE} from "@rpgtools/common/src/type-constants";

export class SecurityContext {
	roles: Role[];
	user: User;

	constructor(user: User, roles: Role[]) {
		this.user = user;
		this.roles = roles;
	}

	hasPermission = (permission: string, entity: PermissionControlledEntity): boolean => {
		for (let entry of entity.acl) {
			if (entry.permission === permission) {
				if (entry.principalType === ROLE) {
					for (let role of this.roles) {
						if (entry.principal === role._id) {
							return true;
						}
					}
				} else if(entry.principal === this.user._id) {
					return true;
				}
			}
		}
		return false;
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
