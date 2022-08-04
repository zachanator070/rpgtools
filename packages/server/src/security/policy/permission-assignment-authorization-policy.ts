import { EntityAuthorizationPolicy } from "../../types";
import { PermissionAssignment } from "../../domain-entities/permission-assignment";
import { SecurityContext } from "../security-context";
import { injectable } from "inversify";

@injectable()
export class PermissionAssignmentAuthorizationPolicy
	implements EntityAuthorizationPolicy<PermissionAssignment>
{
	entity: PermissionAssignment;

	canAdmin = async (context: SecurityContext): Promise<boolean> => {
		// this doesn't make sense to implement
		return false;
	};

	canCreate = async (context: SecurityContext): Promise<boolean> => {
		// this doesn't make sense to implement
		return false;
	};

	canRead = async (context: SecurityContext): Promise<boolean> => {
		return (
			context.hasPermission(this.entity.permission, this.entity.subject) ||
			(await this.canWrite(context))
		);
	};

	canWrite = async (context: SecurityContext): Promise<boolean> => {
		// this doesn't make sense to implement, you have to check the admin permission of the subject
		return false;
	};
}
