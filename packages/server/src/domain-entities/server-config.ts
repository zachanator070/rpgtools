import {AclEntry, DomainEntity, EntityFactory, PermissionControlledEntity, RepositoryAccessor} from "../types";
import { ServerConfigAuthorizationPolicy } from "../security/policy/server-config-authorization-policy";
import { SERVER_CONFIG } from "../../../common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import {Repository} from "../dal/repository/repository";
import {ServerConfigDocument} from "../dal/mongodb/models/server-config";
import ServerConfigModel from "../dal/sql/models/server-config-model";

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
	factory: EntityFactory<ServerConfig, ServerConfigDocument, ServerConfigModel>;

	type: string = SERVER_CONFIG;

	constructor(@inject(INJECTABLE_TYPES.ServerConfigAuthorizationPolicy)
					authorizationPolicy: ServerConfigAuthorizationPolicy,
				@inject(INJECTABLE_TYPES.ServerConfigFactory)
					factory: EntityFactory<ServerConfig, ServerConfigDocument, ServerConfigModel>) {
		authorizationPolicy.entity = this;
		this.authorizationPolicy = authorizationPolicy;
		this.factory = factory;
	}

	getRepository(accessor: RepositoryAccessor): Repository<DomainEntity> {
		return accessor.serverConfigRepository;
	}
}
