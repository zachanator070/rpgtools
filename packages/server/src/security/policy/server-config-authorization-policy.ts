import { EntityAuthorizationPolicy } from "../../types";
import { ServerConfig } from "../../domain-entities/server-config";
import { SecurityContext } from "../security-context";
import {SERVER_ADMIN, SERVER_RW, WORLD_CREATE} from "@rpgtools/common/src/permission-constants";
import { injectable } from "inversify";

@injectable()
export class ServerConfigAuthorizationPolicy
	implements EntityAuthorizationPolicy<ServerConfig>
{
	entity: ServerConfig;

	canAdmin = async (context: SecurityContext): Promise<boolean> => {
		return context.hasPermission(SERVER_ADMIN, this.entity._id);
	};

	canCreate = async (context: SecurityContext): Promise<boolean> => {
		// this doesn't really make sense to implement
		return false;
	};

	canRead = async (context: SecurityContext): Promise<boolean> => {
		return (await this.canAdmin(context)) || (await this.canWrite(context));
	};

	canWrite = async (context: SecurityContext): Promise<boolean> => {
		return context.hasPermission(SERVER_RW, this.entity._id);
	};

	canCreateWorlds = async (context: SecurityContext): Promise<boolean> => {
		return context.hasPermission(WORLD_CREATE, this.entity._id);
	};
}
