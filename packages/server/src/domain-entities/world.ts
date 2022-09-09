import {AclEntry, DomainEntity, Factory, PermissionControlledEntity, Repository, RepositoryAccessor} from "../types";
import { WorldAuthorizationPolicy } from "../security/policy/world-authorization-policy";
import { WORLD } from "@rpgtools/common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";

@injectable()
export class World implements DomainEntity, PermissionControlledEntity {
	public _id: string;
	public name: string;
	public wikiPage: string | null;
	public rootFolder: string | null;
	public type: string = WORLD;
	public acl: AclEntry[];

	authorizationPolicy: WorldAuthorizationPolicy;
	factory: Factory<World>

	constructor(@inject(INJECTABLE_TYPES.WorldAuthorizationPolicy)
					authorizationPolicy: WorldAuthorizationPolicy,
				@inject(INJECTABLE_TYPES.WorldFactory)
					factory: Factory<World>) {
		authorizationPolicy.entity = this;
		this.authorizationPolicy = authorizationPolicy;
		this.factory = factory;
	}

	getRepository(accessor: RepositoryAccessor): Repository<DomainEntity> {
		return accessor.worldRepository;
	}
}
