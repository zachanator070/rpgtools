import {AclEntry, DomainEntity, Factory, PermissionControlledEntity, RepositoryAccessor} from "../types";
import { RoleAuthorizationPolicy } from "../security/policy/role-authorization-policy";
import { ROLE } from "@rpgtools/common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import {Repository} from "../dal/repository/repository";

@injectable()
export class Role implements PermissionControlledEntity {
	public _id: string;
	public name: string;
	// world will be null for server only roles
	public world: string | null;
	public acl: AclEntry[];

	authorizationPolicy: RoleAuthorizationPolicy;
	factory: Factory<Role>;

	type: string = ROLE;

	constructor(@inject(INJECTABLE_TYPES.RoleAuthorizationPolicy)
					authorizationPolicy: RoleAuthorizationPolicy,
				@inject(INJECTABLE_TYPES.RoleFactory)
					factory: Factory<Role>) {
		authorizationPolicy.entity = this;
		this.authorizationPolicy = authorizationPolicy;
		this.factory = factory;
	}

	getRepository(accessor: RepositoryAccessor): Repository<DomainEntity> {
		return accessor.roleRepository;
	}
}
