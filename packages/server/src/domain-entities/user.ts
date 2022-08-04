import {DomainEntity, Factory, Repository, UnitOfWork} from "../types";
import { UserAuthorizationPolicy } from "../security/policy/user-authorization-policy";
import { USER } from "@rpgtools/common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";

@injectable()
export class User implements DomainEntity {
	public _id: string;
	public email: string;
	public username: string;
	public password: string;
	public tokenVersion: string | null;
	public currentWorld: string | null;
	public roles: string[];
	public permissions: string[];

	authorizationPolicy: UserAuthorizationPolicy;
	factory: Factory<User>;

	type: string = USER;

	constructor(@inject(INJECTABLE_TYPES.UserAuthorizationPolicy)
					authorizationPolicy: UserAuthorizationPolicy,
				@inject(INJECTABLE_TYPES.UserFactory)
					factory: Factory<User>) {
		authorizationPolicy.entity = this;
		this.authorizationPolicy = authorizationPolicy;
		this.factory = factory;
	}

	getRepository(unitOfWork: UnitOfWork): Repository<DomainEntity> {
		return unitOfWork.userRepository;
	}
}
