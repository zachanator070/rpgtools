import { DomainEntity } from "../types";

export class Role implements DomainEntity {
	public _id: string;
	public name: string;
	public world: string;
	public permissions: string[];

	constructor(id: string, name: string, worldId: string, permissionIds: string[]) {
		this._id = id;
		this.name = name;
		this.world = worldId;
		this.permissions = permissionIds;
	}
}
