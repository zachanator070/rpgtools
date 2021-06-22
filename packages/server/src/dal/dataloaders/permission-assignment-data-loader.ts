import { GraphqlDataloader } from "../graphql-dataloader";
import { inject } from "inversify";
import { INJECTABLE_TYPES } from "../../injectable-types";
import { PermissionAssignmentRepository } from "../../types";
import { PermissionAssignmentAuthorizationRuleset } from "../../security/permission-assignment-authorization-ruleset";
import { PermissionAssignment } from "../../domain-entities/permission-assignment";

export class PermissionAssignmentDataLoader extends GraphqlDataloader<PermissionAssignment> {
	constructor(
		@inject(INJECTABLE_TYPES.PermissionAssignmentRepository) repo: PermissionAssignmentRepository
	) {
		super(repo, new PermissionAssignmentAuthorizationRuleset());
	}
}
