import {DomainEntity, EntityFactory, RepositoryAccessor} from "../types";
import { PinAuthorizationPolicy } from "../security/policy/pin-authorization-policy";
import { PIN } from "@rpgtools/common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import {Repository} from "../dal/repository/repository";
import PinModel from "../dal/sql/models/pin-model";

@injectable()
export class Pin implements DomainEntity {
	public _id: string;
	public x: number;
	public y: number;
	public map: string;
	public page: string | null;
	public world: string;

	authorizationPolicy: PinAuthorizationPolicy;
	factory: EntityFactory<Pin, PinModel>;

	type: string = PIN;

	constructor(@inject(INJECTABLE_TYPES.PinAuthorizationPolicy)
					authorizationPolicy: PinAuthorizationPolicy,
				@inject(INJECTABLE_TYPES.PinFactory)
					factory: EntityFactory<Pin, PinModel>) {
		authorizationPolicy.entity = this;
		this.authorizationPolicy = authorizationPolicy;
		this.factory = factory;
	}

	getRepository(accessor: RepositoryAccessor): Repository<DomainEntity> {
		return accessor.pinRepository;
	}
}
