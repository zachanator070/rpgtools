import { GraphqlDataloader } from "../graphql-dataloader";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import { PermissionAssignmentRepository } from "../../types";
import { PermissionAssignmentAuthorizationRuleset } from "../../security/ruleset/permission-assignment-authorization-ruleset";
import { PermissionAssignment } from "../../domain-entities/permission-assignment";

@injectable()
export class PermissionAssignmentDataLoader extends GraphqlDataloader<PermissionAssignment> {
	@inject(INJECTABLE_TYPES.PermissionAssignmentRepository)
	repository: PermissionAssignmentRepository;
	@inject(INJECTABLE_TYPES.PermissionAssignmentAuthorizationRuleset)
	ruleset: PermissionAssignmentAuthorizationRuleset;
}
