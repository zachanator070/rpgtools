import { EntityAuthorizationPolicy } from "../../types";
import { User } from "../../domain-entities/user.js";
import { SecurityContext } from "../security-context.js";
import { injectable } from "inversify";

@injectable()
export class UserAuthorizationPolicy implements EntityAuthorizationPolicy {
	entity: User;

	canAdmin = async (context: SecurityContext): Promise<boolean> => {
		return context.user._id === this.entity._id;
	};

	canCreate = async (context: SecurityContext): Promise<boolean> => {
		// doesn't really make sense to implement
		return false;
	};

	canRead = async (context: SecurityContext): Promise<boolean> => {
		// doesn't really make sense to implement
		return false;
	};

	canWrite = async (context: SecurityContext): Promise<boolean> => {
		return context.user._id === this.entity._id;
	};
}
