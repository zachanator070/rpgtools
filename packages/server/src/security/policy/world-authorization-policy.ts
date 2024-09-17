import {EntityAuthorizationPolicy} from "../../types";
import { World } from "../../domain-entities/world.js";
import { SecurityContext } from "../security-context.js";
import { ServerConfig } from "../../domain-entities/server-config.js";
import {
	WORLD_ADMIN,
	WORLD_ADMIN_ALL,
	WORLD_CREATE,
	WORLD_READ,
	WORLD_READ_ALL,
	WORLD_RW,
} from "@rpgtools/common/src/permission-constants.js";
import { injectable } from "inversify";
import {DatabaseContext} from "../../dal/database-context.js";

@injectable()
export class WorldAuthorizationPolicy implements EntityAuthorizationPolicy {

	entity: World;

	canAdmin = async (context: SecurityContext, databaseContext: DatabaseContext): Promise<boolean> => {
		const serverConfig: ServerConfig = await databaseContext.serverConfigRepository.findOne();
		return (
			context.hasPermission(WORLD_ADMIN, this.entity) ||
			context.hasPermission(WORLD_ADMIN_ALL, serverConfig)
		);
	};

	canCreate = async (context: SecurityContext, databaseContext: DatabaseContext): Promise<boolean> => {
		const serverConfig: ServerConfig = await databaseContext.serverConfigRepository.findOne();
		return context.hasPermission(WORLD_CREATE, serverConfig);
	};

	canRead = async (context: SecurityContext, databaseContext: DatabaseContext): Promise<boolean> => {
		const serverConfig: ServerConfig = await databaseContext.serverConfigRepository.findOne();
		return (
			context.hasPermission(WORLD_READ, this.entity) ||
			context.hasPermission(WORLD_READ_ALL, serverConfig) ||
			(await this.canWrite(context))
		);
	};

	canWrite = async (context: SecurityContext): Promise<boolean> => {
		return context.hasPermission(WORLD_RW, this.entity);
	};
}
