import { DomainEntity, EntityAuthorizationRuleset } from "../types";
import { PermissionAssignmentAuthorizationRuleset } from "../security/permission-assignment-authorization-ruleset";
import { PERMISSION_ASSIGNMENT } from "../../../common/src/type-constants";

export class PermissionAssignment implements DomainEntity {
	public _id: string;
	public permission: string;
	public subject: string;
	public subjectType: string;

	authorizationRuleset: EntityAuthorizationRuleset<PermissionAssignment, DomainEntity> =
		new PermissionAssignmentAuthorizationRuleset();
	type: string = PERMISSION_ASSIGNMENT;

	constructor(id: string, permission: string, subject: string, subjectType: string) {
		this._id = id;
		this.permission = permission;
		this.subject = subject;
		this.subjectType = subjectType;
	}
}
