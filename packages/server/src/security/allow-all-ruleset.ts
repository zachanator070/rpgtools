import { DomainEntity, EntityAuthorizationRuleset } from "../types";
import { SecurityContext } from "../security-context";

export class AllowAllRuleset<T extends DomainEntity, Parent extends DomainEntity>
	implements EntityAuthorizationRuleset<T, Parent> {
	canAdmin = async (context: SecurityContext, entity: T): Promise<boolean> => true;

	canCreate = async (context: SecurityContext, entity: Parent): Promise<boolean> => true;

	canRead = async (context: SecurityContext, entity: T): Promise<boolean> => true;

	canWrite = async (context: SecurityContext, entity: T): Promise<boolean> => true;
}
