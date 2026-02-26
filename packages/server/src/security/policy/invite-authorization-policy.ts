import { EntityAuthorizationPolicy } from "../../types.js";
import { injectable } from "inversify";
import { SecurityContext } from "../security-context.js";

@injectable()
export class InviteAuthorizationPolicy implements EntityAuthorizationPolicy {
	canAdmin = async (_context: SecurityContext): Promise<boolean> => false;
	canCreate = async (_context: SecurityContext): Promise<boolean> => false;
	canRead = async (_context: SecurityContext): Promise<boolean> => false;
	canWrite = async (_context: SecurityContext): Promise<boolean> => false;
}
