import { EntityAuthorizationRuleset } from "../types";
import { Role } from "../domain-entities/role";
import { SecurityContext } from "../security-context";
import {
	ROLE_ADD,
	ROLE_ADMIN,
	ROLE_ADMIN_ALL,
	ROLE_READ,
	ROLE_READ_ALL,
	ROLE_RW,
	ROLE_RW_ALL,
} from "../../../common/src/permission-constants";
import { EVERYONE } from "../../../common/src/role-constants";
import { World } from "../domain-entities/world";
import { injectable } from "inversify";

@injectable()
export class RoleAuthorizationRuleset implements EntityAuthorizationRuleset<Role, World> {
	canAdmin = async (context: SecurityContext, entity: Role): Promise<boolean> => {
		return (
			context.hasPermission(ROLE_ADMIN, entity._id) ||
			context.hasPermission(ROLE_ADMIN_ALL, entity.world)
		);
	};

	canCreate = async (context: SecurityContext, entity: World): Promise<boolean> => {
		return context.hasPermission(ROLE_ADD, entity._id);
	};

	canRead = async (context: SecurityContext, entity: Role): Promise<boolean> => {
		return (
			(await this.canWrite(context, entity)) ||
			context.hasPermission(ROLE_READ, entity._id) ||
			context.hasPermission(ROLE_READ_ALL, entity.world) ||
			context.hasRole(entity.name) ||
			entity.name === EVERYONE
		);
	};

	canWrite = async (context: SecurityContext, entity: Role): Promise<boolean> => {
		return (
			context.hasPermission(ROLE_RW, entity._id) || context.hasPermission(ROLE_RW_ALL, entity.world)
		);
	};
}
