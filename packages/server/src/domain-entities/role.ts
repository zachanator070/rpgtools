import {AclEntry, DomainEntity, EntityFactory, PermissionControlledEntity, RepositoryAccessor} from "../types";
import { RoleAuthorizationPolicy } from "../security/policy/role-authorization-policy.js";
import { ROLE } from "@rpgtools/common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types.js";
import {Repository} from "../dal/repository/repository.js";
import {RoleModel} from "../dal/sql/models/role-model.js";

@injectable()
export class Role implements PermissionControlledEntity {
	public _id: string;
	public name: string;
	// world will be null for server only roles
	public world: string | null;
	public acl: AclEntry[];

	authorizationPolicy: RoleAuthorizationPolicy;
	factory: EntityFactory<Role, RoleModel>;

	type: string = ROLE;

	constructor(@inject(INJECTABLE_TYPES.RoleAuthorizationPolicy)
					authorizationPolicy: RoleAuthorizationPolicy,
				@inject(INJECTABLE_TYPES.RoleFactory)
					factory: EntityFactory<Role, RoleModel>) {
		authorizationPolicy.entity = this;
		this.authorizationPolicy = authorizationPolicy;
		this.factory = factory;
	}

	getRepository(accessor: RepositoryAccessor): Repository<DomainEntity> {
		return accessor.roleRepository;
	}
}
