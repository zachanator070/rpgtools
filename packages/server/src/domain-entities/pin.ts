import {DomainEntity, Repository, UnitOfWork} from "../types";
import { PinAuthorizationPolicy } from "../security/policy/pin-authorization-policy";
import { PIN } from "@rpgtools/common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";

@injectable()
export class Pin implements DomainEntity {
	public _id: string;
	public x: number;
	public y: number;
	public map: string;
	public page: string | null;

	authorizationPolicy: PinAuthorizationPolicy;
	type: string = PIN;

	constructor(@inject(INJECTABLE_TYPES.PinAuthorizationPolicy)
					authorizationPolicy: PinAuthorizationPolicy) {
		authorizationPolicy.entity = this;
		this.authorizationPolicy = authorizationPolicy;
	}
	getRepository(unitOfWork: UnitOfWork): Repository<DomainEntity> {
		return unitOfWork.pinRepository;
	}
}
