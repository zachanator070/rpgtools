import {DomainEntity, Factory, Repository, UnitOfWork} from "../types";
import { RoleAuthorizationPolicy } from "../security/policy/role-authorization-policy";
import { ROLE } from "@rpgtools/common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";

@injectable()
export class Role implements DomainEntity {
	public _id: string;
	public name: string;
	// world will be null for server only roles
	public world: string | null;
	public permissions: string[];

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

	getRepository(unitOfWork: UnitOfWork): Repository<DomainEntity> {
		return unitOfWork.roleRepository;
	}
}
