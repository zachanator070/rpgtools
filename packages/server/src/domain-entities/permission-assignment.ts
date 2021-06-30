import { DomainEntity } from "../types";
import { PermissionAssignmentAuthorizationRuleset } from "../security/permission-assignment-authorization-ruleset";
import { PERMISSION_ASSIGNMENT } from "../../../common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../injectable-types";

@injectable()
export class PermissionAssignment implements DomainEntity {
	public _id: string;
	public permission: string;
	public subject: string;
	public subjectType: string;

	@inject(INJECTABLE_TYPES.PermissionAssignmentAuthorizationRuleset)
	authorizationRuleset: PermissionAssignmentAuthorizationRuleset;

	type: string = PERMISSION_ASSIGNMENT;
}
