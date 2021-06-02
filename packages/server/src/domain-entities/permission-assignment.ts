import { DomainEntity } from "../types";

export class PermissionAssignment implements DomainEntity {
	public _id: string;
	public permission: string;
	public subjectId: string;
	public subjectType: string;

	constructor(id: string, permission: string, subjectId: string, subjectType: string) {
		this._id = id;
		this.permission = permission;
		this.subjectId = subjectId;
		this.subjectType = subjectType;
	}
}
