import { DomainEntity } from "../types";

export class World implements DomainEntity {
	public _id: string;
	public name: string;
	public wikiPage?: string;
	public rootFolder?: string;
	public roles: string[];
	public pins: string[];

	constructor(
		id: string,
		name: string,
		wikiPageId: string,
		rootFolderId: string,
		roleIds: string[],
		pinIds: string[]
	) {
		this._id = id;
		this.name = name;
		this.wikiPage = wikiPageId;
		this.rootFolder = rootFolderId;
		this.roles = roleIds;
		this.pins = pinIds;
	}
}
