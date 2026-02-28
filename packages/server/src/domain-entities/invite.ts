import { DomainEntity, EntityFactory, RepositoryAccessor } from "../types.js";
import { INVITE } from "@rpgtools/common/src/type-constants.js";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types.js";
import { Repository } from "../dal/repository/repository.js";
import InviteModel from "../dal/sql/models/invite-model.js";
import { InviteAuthorizationPolicy } from "../security/policy/invite-authorization-policy.js";

@injectable()
export class Invite implements DomainEntity {
	public _id: string;
	public email: string;
	public createdByUserId: string | null;

	authorizationPolicy: InviteAuthorizationPolicy;
	factory: EntityFactory<Invite, InviteModel>;

	type: string = INVITE;

	constructor(
		@inject(INJECTABLE_TYPES.InviteAuthorizationPolicy)
		authorizationPolicy: InviteAuthorizationPolicy,
		@inject(INJECTABLE_TYPES.InviteFactory)
		factory: EntityFactory<Invite, InviteModel>
	) {
		this.authorizationPolicy = authorizationPolicy;
		this.factory = factory;
	}

	getRepository(accessor: RepositoryAccessor): Repository<DomainEntity> {
		return (accessor as any).inviteRepository;
	}
}
