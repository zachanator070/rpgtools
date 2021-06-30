import { DomainEntity } from "../types";
import { ServerConfigAuthorizationRuleset } from "../security/server-config-authorization-ruleset";
import { SERVER_CONFIG } from "../../../common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../injectable-types";

@injectable()
export class ServerConfig implements DomainEntity {
	public _id: string;
	public version: string;
	public registerCodes: string[];
	public adminUsers: string[];
	public unlockCode: string;

	@inject(INJECTABLE_TYPES.ServerConfigAuthorizationRuleset)
	authorizationRuleset: ServerConfigAuthorizationRuleset;

	type: string = SERVER_CONFIG;
}
