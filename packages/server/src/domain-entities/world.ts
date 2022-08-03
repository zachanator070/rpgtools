import {DomainEntity, Repository, UnitOfWork} from "../types";
import { WorldAuthorizationPolicy } from "../security/policy/world-authorization-policy";
import { WORLD } from "@rpgtools/common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";

@injectable()
export class World implements DomainEntity {
	public _id: string;
	public name: string;
	public wikiPage: string | null;
	public rootFolder: string | null;
	public roles: string[];
	public pins: string[];
	public type: string = WORLD;

	authorizationPolicy: WorldAuthorizationPolicy;

	constructor(@inject(INJECTABLE_TYPES.WorldAuthorizationPolicy)
				authorizationPolicy: WorldAuthorizationPolicy) {
		authorizationPolicy.entity = this;
		this.authorizationPolicy = authorizationPolicy;
	}

	getRepository(unitOfWork: UnitOfWork): Repository<DomainEntity> {
		return unitOfWork.worldRepository;
	}
}
