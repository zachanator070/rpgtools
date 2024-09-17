import {AclEntry, DomainEntity, EntityFactory, PermissionControlledEntity, RepositoryAccessor} from "../types";
import { ServerConfigAuthorizationPolicy } from "../security/policy/server-config-authorization-policy.js";
import { SERVER_CONFIG } from "@rpgtools/common/src/type-constants.js";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types.js";
import {Repository} from "../dal/repository/repository.js";
import ServerConfigModel from "../dal/sql/models/server-config-model.js";

@injectable()
export class ServerConfig implements PermissionControlledEntity {
	public _id: string;
	public version: string;
	public registerCodes: string[];
	public adminUsers: string[];
	public unlockCode: string;
	public acl: AclEntry[];
	public defaultWorld: string;

	authorizationPolicy: ServerConfigAuthorizationPolicy;
	factory: EntityFactory<ServerConfig, ServerConfigModel>;

	type: string = SERVER_CONFIG;

	constructor(@inject(INJECTABLE_TYPES.ServerConfigAuthorizationPolicy)
					authorizationPolicy: ServerConfigAuthorizationPolicy,
				@inject(INJECTABLE_TYPES.ServerConfigFactory)
					factory: EntityFactory<ServerConfig, ServerConfigModel>) {
		authorizationPolicy.entity = this;
		this.authorizationPolicy = authorizationPolicy;
		this.factory = factory;
	}

	getRepository(accessor: RepositoryAccessor): Repository<DomainEntity> {
		return accessor.serverConfigRepository;
	}
}
