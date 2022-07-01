import { DomainEntity, EntityAuthorizationRuleset } from "../../types";
import { User } from "../../domain-entities/user";
import { SecurityContext } from "../security-context";
import { injectable } from "inversify";

@injectable()
export class UserAuthorizationRuleset implements EntityAuthorizationRuleset<User, DomainEntity> {
	canAdmin = async (context: SecurityContext, entity: User): Promise<boolean> => {
		return context.user._id === entity._id;
	};

	canCreate = async (context: SecurityContext, entity: DomainEntity): Promise<boolean> => {
		// doesn't really make sense to implement
		return false;
	};

	canRead = async (context: SecurityContext, entity: User): Promise<boolean> => {
		// doesn't really make sense to implement
		return false;
	};

	canWrite = async (context: SecurityContext, entity: User): Promise<boolean> => {
		return context.user._id === entity._id;
	};
}
