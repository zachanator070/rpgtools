import { DomainEntity } from "../types";
import { Role } from "./role";

export class User implements DomainEntity {
	public _id: string;
	public email: string;
	public username: string;
	public password: string;
	public tokenVersion: string;
	public currentWorldId: string;
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
		this.currentWorldId = currentWorldId;
		this.roles = roleIds;
		this.permissions = permissionIds;
	}
}
