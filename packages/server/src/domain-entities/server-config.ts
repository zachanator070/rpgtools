import {AclEntry, DomainEntity, Factory, PermissionControlledEntity, Repository, RepositoryAccessor} from "../types";
import { ServerConfigAuthorizationPolicy } from "../security/policy/server-config-authorization-policy";
import { SERVER_CONFIG } from "../../../common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";

@injectable()
export class ServerConfig implements DomainEntity, PermissionControlledEntity {
	public _id: string;
	public version: string;
	public registerCodes: string[];
	public adminUsers: string[];
	public unlockCode: string;
	public acl: AclEntry[];

	authorizationPolicy: ServerConfigAuthorizationPolicy;
	factory: Factory<ServerConfig>;

	type: string = SERVER_CONFIG;

	constructor(@inject(INJECTABLE_TYPES.ServerConfigAuthorizationPolicy)
					authorizationPolicy: ServerConfigAuthorizationPolicy,
				@inject(INJECTABLE_TYPES.ServerConfigFactory)
					factory: Factory<ServerConfig>) {
		authorizationPolicy.entity = this;
		this.authorizationPolicy = authorizationPolicy;
		this.factory = factory;
	}

	getRepository(accessor: RepositoryAccessor): Repository<DomainEntity> {
		return accessor.serverConfigRepository;
	}
}
