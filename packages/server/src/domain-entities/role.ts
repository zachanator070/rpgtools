import { DomainEntity } from "../types";
import { RoleAuthorizationRuleset } from "../security/ruleset/role-authorization-ruleset";
import { ROLE } from "@rpgtools/common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";

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
