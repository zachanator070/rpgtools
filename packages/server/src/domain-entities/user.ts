import { DomainEntity, EntityAuthorizationRuleset } from "../types";
import { UserAuthorizationRuleset } from "../security/user-authorization-ruleset";
import { USER } from "../../../common/src/type-constants";

export class User implements DomainEntity {
	public _id: string;
	public email: string;
	public username: string;
	public password: string;
	public tokenVersion: string;
	public currentWorld: string;
	public roles: string[];
	public permissions: string[];

	constructor(
		_id: string,
		email: string,
		username: string,
		password: string,
		tokenVersion: string,
		currentWorldId: string,
		roleIds: string[],
		permissionIds: string[]
	) {
		this._id = _id;
		this.email = email;
		this.username = username;
		this.password = password;
		this.tokenVersion = tokenVersion;
		this.currentWorld = currentWorldId;
		this.roles = roleIds;
		this.permissions = permissionIds;
	}

	authorizationRuleset: EntityAuthorizationRuleset<
		User,
		DomainEntity
	> = new UserAuthorizationRuleset();
	type: string = USER;
}
