import { DomainEntity, EntityAuthorizationRuleset } from "../types";
import { PermissionAssignment } from "../domain-entities/permission-assignment";
import { SecurityContext } from "../security-context";

export class PermissionAssignmentAuthorizationRuleset
	implements EntityAuthorizationRuleset<PermissionAssignment, DomainEntity> {
	canAdmin = async (context: SecurityContext, entity: PermissionAssignment): Promise<boolean> => {
		// this doesn't make sense to implement
		return false;
	};

	canCreate = async (context: SecurityContext, entity: DomainEntity): Promise<boolean> => {
		// this doesn't make sense to implement
		return false;
	};

	canRead = async (context: SecurityContext, entity: PermissionAssignment): Promise<boolean> => {
		return (
			context.hasPermission(entity.permission, entity.subjectId) ||
			(await this.canWrite(context, entity))
		);
	};

	canWrite = async (context: SecurityContext, entity: PermissionAssignment): Promise<boolean> => {
		return context.hasPermission(entity.permission, entity.subjectId);
	};
}
