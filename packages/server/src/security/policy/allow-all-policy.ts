import { DomainEntity, EntityAuthorizationPolicy } from "../../types";
import { injectable } from "inversify";

@injectable()
export abstract class AllowAllPolicy<T extends DomainEntity>
	implements EntityAuthorizationPolicy<T>
{
	canAdmin = async (): Promise<boolean> => true;

	canCreate = async (): Promise<boolean> => true;

	canRead = async (): Promise<boolean> => true;

	canWrite = async (): Promise<boolean> => true;
}
