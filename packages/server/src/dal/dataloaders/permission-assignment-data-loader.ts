import { GraphqlDataloader } from "../graphql-dataloader";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import { PermissionAssignmentRepository } from "../../types";
import { PermissionAssignmentAuthorizationPolicy } from "../../security/policy/permission-assignment-authorization-policy";
import { PermissionAssignment } from "../../domain-entities/permission-assignment";

@injectable()
export class PermissionAssignmentDataLoader extends GraphqlDataloader<PermissionAssignment> {

	@inject(INJECTABLE_TYPES.PermissionAssignmentRepository)
	repository: PermissionAssignmentRepository;

}
