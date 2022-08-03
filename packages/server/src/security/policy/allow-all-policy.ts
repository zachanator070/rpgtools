import { DomainEntity, EntityAuthorizationPolicy } from "../../types";
import { SecurityContext } from "../security-context";
import { injectable } from "inversify";

@injectable()
export abstract class AllowAllPolicy<T extends DomainEntity>
	implements EntityAuthorizationPolicy<T>
{
	canAdmin = async (context: SecurityContext): Promise<boolean> => true;

	canCreate = async (context: SecurityContext): Promise<boolean> => true;

	canRead = async (context: SecurityContext): Promise<boolean> => true;

	canWrite = async (context: SecurityContext): Promise<boolean> => true;
}
