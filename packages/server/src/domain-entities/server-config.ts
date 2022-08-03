import {DomainEntity, Repository, UnitOfWork} from "../types";
import { ServerConfigAuthorizationPolicy } from "../security/policy/server-config-authorization-policy";
import { SERVER_CONFIG } from "../../../common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";

@injectable()
export class ServerConfig implements DomainEntity {
	public _id: string;
	public version: string;
	public registerCodes: string[];
	public adminUsers: string[];
	public unlockCode: string;

	authorizationPolicy: ServerConfigAuthorizationPolicy;

	type: string = SERVER_CONFIG;

	constructor(@inject(INJECTABLE_TYPES.ServerConfigAuthorizationPolicy)
					authorizationPolicy: ServerConfigAuthorizationPolicy) {
		authorizationPolicy.entity = this;
		this.authorizationPolicy = authorizationPolicy;
	}

	getRepository(unitOfWork: UnitOfWork): Repository<DomainEntity> {
		return unitOfWork.serverConfigRepository;
	}
}
