import { EntityAuthorizationPolicy } from "../../types";
import { injectable } from "inversify";

@injectable()
export abstract class AllowAllPolicy
	implements EntityAuthorizationPolicy
{
	canAdmin = async (): Promise<boolean> => true;

	canCreate = async (): Promise<boolean> => true;

	canRead = async (): Promise<boolean> => true;

	canWrite = async (): Promise<boolean> => true;
}
