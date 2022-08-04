import {DomainEntity, Factory, Repository, UnitOfWork} from "../types";
import { PermissionAssignmentAuthorizationPolicy } from "../security/policy/permission-assignment-authorization-policy";
import { PERMISSION_ASSIGNMENT } from "@rpgtools/common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";

@injectable()
export class PermissionAssignment implements DomainEntity {
	public _id: string;
	public permission: string;
	public subject: string;
	public subjectType: string;

	authorizationPolicy: PermissionAssignmentAuthorizationPolicy;
	factory: Factory<PermissionAssignment>;

	type: string = PERMISSION_ASSIGNMENT;

	constructor(@inject(INJECTABLE_TYPES.PermissionAssignmentAuthorizationPolicy)
					authorizationPolicy: PermissionAssignmentAuthorizationPolicy,
				@inject(INJECTABLE_TYPES.PermissionAssignmentFactory)
					factory: Factory<PermissionAssignment>) {
		authorizationPolicy.entity = this;
		this.authorizationPolicy = authorizationPolicy;
		this.factory = factory;
	}

	getRepository(unitOfWork: UnitOfWork): Repository<DomainEntity> {
		return unitOfWork.permissionAssignmentRepository;
	}
}
