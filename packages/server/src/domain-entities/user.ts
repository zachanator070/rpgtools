import {DomainEntity, EntityFactory, Factory, RepositoryAccessor} from "../types";
import { UserAuthorizationPolicy } from "../security/policy/user-authorization-policy";
import { USER } from "@rpgtools/common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import {Repository} from "../dal/repository/repository";
import {UserDocument} from "../dal/mongodb/models/user";

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
	factory: EntityFactory<User, UserDocument>;

	type: string = USER;

	constructor(@inject(INJECTABLE_TYPES.UserAuthorizationPolicy)
					authorizationPolicy: UserAuthorizationPolicy,
				@inject(INJECTABLE_TYPES.UserFactory)
					factory: EntityFactory<User, UserDocument>) {
		authorizationPolicy.entity = this;
		this.authorizationPolicy = authorizationPolicy;
		this.factory = factory;
	}

	getRepository(accessor: RepositoryAccessor): Repository<DomainEntity> {
		return accessor.userRepository;
	}
}
