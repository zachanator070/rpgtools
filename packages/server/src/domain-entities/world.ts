import { DomainEntity, EntityAuthorizationRuleset } from "../types";
import { WorldAuthorizationRuleset } from "../security/world-authorization-ruleset";
import { WORLD } from "../../../common/src/type-constants";

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

	authorizationRuleset: EntityAuthorizationRuleset<
		this,
		DomainEntity
	> = new WorldAuthorizationRuleset();
	type: string = WORLD;
}
