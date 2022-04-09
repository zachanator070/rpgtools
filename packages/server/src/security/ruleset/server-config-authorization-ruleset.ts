import { DomainEntity, EntityAuthorizationRuleset } from "../../types";
import { ServerConfig } from "../../domain-entities/server-config";
import { SecurityContext } from "../security-context";
import { SERVER_ADMIN, SERVER_RW } from "../../../../common/src/permission-constants";
import { injectable } from "inversify";

@injectable()
export class ServerConfigAuthorizationRuleset
	implements EntityAuthorizationRuleset<ServerConfig, DomainEntity>
{
	canAdmin = async (context: SecurityContext, entity: ServerConfig): Promise<boolean> => {
		return context.hasPermission(SERVER_ADMIN, entity._id);
	};

	canCreate = async (context: SecurityContext, entity: DomainEntity): Promise<boolean> => {
		// this doesn't really make sense to implement
		return false;
	};

	canRead = async (context: SecurityContext, entity: ServerConfig): Promise<boolean> => {
		return (await this.canAdmin(context, entity)) || (await this.canWrite(context, entity));
	};

	canWrite = async (context: SecurityContext, entity: ServerConfig): Promise<boolean> => {
		return context.hasPermission(SERVER_RW, entity._id);
	};
}
