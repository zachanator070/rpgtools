import { DomainEntity, EntityAuthorizationRuleset, Repository } from "../types";
import { World } from "../domain-entities/world";
import { SecurityContext } from "../security-context";
import { ServerConfig } from "../domain-entities/server-config";
import {
	WORLD_ADMIN,
	WORLD_ADMIN_ALL,
	WORLD_CREATE,
	WORLD_READ,
	WORLD_READ_ALL,
	WORLD_RW,
} from "../../../common/src/permission-constants";
import { inject } from "inversify";
import { INJECTABLE_TYPES } from "../injectable-types";
import { ServerConfigAuthorizationRuleset } from "./server-config-authorization-ruleset";

export class WorldAuthorizationRuleset implements EntityAuthorizationRuleset<World, ServerConfig> {
	@inject(INJECTABLE_TYPES.ServerConfigRepository)
	serverConfigRepository: Repository<ServerConfig>;

	canAdmin = async (context: SecurityContext, entity: World): Promise<boolean> => {
		const serverConfig: ServerConfig = await this.serverConfigRepository.findOne([]);
		return (
			context.hasPermission(WORLD_ADMIN, entity._id) ||
			context.hasPermission(WORLD_ADMIN_ALL, serverConfig._id)
		);
	};

	canCreate = async (context: SecurityContext, entity: ServerConfig): Promise<boolean> => {
		return context.hasPermission(WORLD_CREATE, entity._id);
	};

	canRead = async (context: SecurityContext, entity: World): Promise<boolean> => {
		const serverConfig: ServerConfig = await this.serverConfigRepository.findOne([]);
		return (
			(await context.hasPermission(WORLD_READ, entity._id)) ||
			context.hasPermission(WORLD_READ_ALL, serverConfig._id) ||
			(await this.canWrite(context, entity))
		);
	};

	canWrite = async (context: SecurityContext, entity: World): Promise<boolean> => {
		return context.hasPermission(WORLD_RW, entity._id);
	};
}
