import { DomainEntity, EntityAuthorizationRuleset } from "../types";
import { WikiPageAuthorizationRuleset } from "../security/wiki-page-authorization-ruleset";

export abstract class WikiPage implements DomainEntity {
	public _id: string;
	public name: string;
	public world: string;
	public coverImage?: string;
	public contentId?: string;
	public content?: string;

	authorizationRuleset: EntityAuthorizationRuleset<
		this,
		DomainEntity
	> = new WikiPageAuthorizationRuleset();
	abstract type: string;

	constructor(id: string, name: string, worldId: string, coverImageId: string, contentId: string) {
		this._id = id;
		this.name = name;
		this.world = worldId;
		this.coverImage = coverImageId;
		this.contentId = contentId;
	}
}
