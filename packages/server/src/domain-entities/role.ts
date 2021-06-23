import { DomainEntity, EntityAuthorizationRuleset } from "../types";
import { RoleAuthorizationRuleset } from "../security/role-authorization-ruleset";
import { World } from "./world";
import { ROLE } from "../../../common/src/type-constants";

export class Role implements DomainEntity {
	public _id: string;
	public name: string;
	// world will be null for server only roles
	public world?: string;
	public permissions: string[];

	authorizationRuleset: EntityAuthorizationRuleset<Role, World> = new RoleAuthorizationRuleset();
	type: string = ROLE;

	constructor(id: string, name: string, worldId: string, permissionIds: string[]) {
		this._id = id;
		this.name = name;
		this.world = worldId;
		this.permissions = permissionIds;
	}
}
