import { DomainEntity } from "../types";

export class ServerConfig implements DomainEntity {
	public _id: string;
	public version: string;
	public registerCodes: string[];
	public adminUsers: string[];
	public unlockCode: string;

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
