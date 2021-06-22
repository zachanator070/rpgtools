import { DomainEntity, EntityAuthorizationRuleset } from "../types";
import { ServerConfigAuthorizationRuleset } from "../security/server-config-authorization-ruleset";
import { SERVER_CONFIG } from "../../../common/src/type-constants";

export class ServerConfig implements DomainEntity {
	public _id: string;
	public version: string;
	public registerCodes: string[];
	public adminUsers: string[];
	public unlockCode: string;

	authorizationRuleset: EntityAuthorizationRuleset<
		ServerConfig,
		DomainEntity
	> = new ServerConfigAuthorizationRuleset();
	type: string = SERVER_CONFIG;

	constructor(
		id: string,
		version: string,
		registerCodes: string[],
		adminUserIds: string[],
		unlockCode: string
	) {
		this._id = id;
		this.version = version;
		this.registerCodes = registerCodes;
		this.adminUsers = adminUserIds;
		this.unlockCode = unlockCode;
	}
}
