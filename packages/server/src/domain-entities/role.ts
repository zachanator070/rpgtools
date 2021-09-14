import { DomainEntity } from "../types";
import { RoleAuthorizationRuleset } from "../security/role-authorization-ruleset";
import { ROLE } from "../../../common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../injectable-types";

@injectable()
export class Role implements DomainEntity {
	public _id: string;
	public name: string;
	// world will be null for server only roles
	public world: string | null;
	public permissions: string[];

	@inject(INJECTABLE_TYPES.RoleAuthorizationRuleset)
	authorizationRuleset: RoleAuthorizationRuleset;

	type: string = ROLE;
}
