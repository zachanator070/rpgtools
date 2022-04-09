import { DomainEntity, EntityAuthorizationRuleset, Repository } from "../../types";
import { PermissionAssignment } from "../../domain-entities/permission-assignment";
import { SecurityContext } from "../security-context";
import { RepositoryMapper } from "../../dal/repository-mapper";
import { injectable } from "inversify";

@injectable()
export class PermissionAssignmentAuthorizationRuleset
	implements EntityAuthorizationRuleset<PermissionAssignment, DomainEntity>
{
	repoMapper = new RepositoryMapper();

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
			context.hasPermission(entity.permission, entity.subject) ||
			(await this.canWrite(context, entity))
		);
	};

	canWrite = async (context: SecurityContext, entity: PermissionAssignment): Promise<boolean> => {
		const repo = this.repoMapper.map<DomainEntity>(entity.subjectType);
		const subject = await repo.findById(entity.subject);
		return subject.authorizationRuleset.canAdmin(context, subject);
	};
}
