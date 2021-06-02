import { DomainEntity } from "../types";

export class WikiFolder implements DomainEntity {
	public _id: string;
	public name: string;
	public world: string;
	public pages: string[];
	public children: string[];

	constructor(id: string, name: string, worldId: string, pageIds: string[], childrenIds: string[]) {
		this._id = id;
		this.name = name;
		this.world = worldId;
		this.pages = pageIds;
		this.children = childrenIds;
	}
}
