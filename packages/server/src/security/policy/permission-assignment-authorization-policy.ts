import { DomainEntity, EntityAuthorizationPolicy, Repository } from "../../types";
import { PermissionAssignment } from "../../domain-entities/permission-assignment";
import { SecurityContext } from "../security-context";
import { RepositoryMapper } from "../../dal/repository-mapper";
import { injectable } from "inversify";

@injectable()
export class PermissionAssignmentAuthorizationPolicy
	implements EntityAuthorizationPolicy<PermissionAssignment>
{
	repoMapper = new RepositoryMapper();
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
		const repo = this.repoMapper.map<DomainEntity>(this.entity.subjectType);
		const subject = await repo.findById(this.entity.subject);
		return subject.authorizationPolicy.canAdmin(context);
	};
}
