import {DomainEntity, Factory, Repository, RepositoryAccessor} from "../types";
import { PinAuthorizationPolicy } from "../security/policy/pin-authorization-policy";
import { PIN } from "@rpgtools/common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";

export interface PinIcon {
	builtInIcon?: string;
	color?: string;
	size: number;
	image?: string;
}

@injectable()
export class Pin implements DomainEntity {
	public _id: string;
	public x: number;
	public y: number;
	public map: string;
	public page?: string | null;
	public icon?: PinIcon;

	authorizationPolicy: PinAuthorizationPolicy;
	factory: Factory<Pin>;

	type: string = PIN;

	constructor(@inject(INJECTABLE_TYPES.PinAuthorizationPolicy)
					authorizationPolicy: PinAuthorizationPolicy,
				@inject(INJECTABLE_TYPES.PinFactory)
					factory: Factory<Pin>) {
		authorizationPolicy.entity = this;
		this.authorizationPolicy = authorizationPolicy;
	}

	getRepository(accessor: RepositoryAccessor): Repository<DomainEntity> {
		return accessor.pinRepository;
	}
}
