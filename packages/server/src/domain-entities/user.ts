import {DomainEntity, EntityFactory, RepositoryAccessor} from "../types";
import { UserAuthorizationPolicy } from "../security/policy/user-authorization-policy";
import { USER } from "@rpgtools/common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import {Repository} from "../dal/repository/repository";
import UserModel from "../dal/sql/models/user-model";

@injectable()
export class User implements DomainEntity {
	public _id: string;
	public email: string;
	public username: string;
	public password: string;
	public tokenVersion: string | null;
	public currentWorld: string | null;
	public roles: string[];

	authorizationPolicy: UserAuthorizationPolicy;
	factory: EntityFactory<User, UserModel>;

	type: string = USER;

	constructor(@inject(INJECTABLE_TYPES.UserAuthorizationPolicy)
					authorizationPolicy: UserAuthorizationPolicy,
				@inject(INJECTABLE_TYPES.UserFactory)
					factory: EntityFactory<User, UserModel>) {
		authorizationPolicy.entity = this;
		this.authorizationPolicy = authorizationPolicy;
		this.factory = factory;
	}

	getRepository(accessor: RepositoryAccessor): Repository<DomainEntity> {
		return accessor.userRepository;
	}
}
