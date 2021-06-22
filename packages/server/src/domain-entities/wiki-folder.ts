import { DomainEntity, EntityAuthorizationRuleset } from "../types";
import { WikiFolderAuthorizationRuleset } from "../security/wiki-folder-authorization-ruleset";
import { WIKI_FOLDER } from "../../../common/src/type-constants";

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

	authorizationRuleset: EntityAuthorizationRuleset<
		WikiFolder,
		WikiFolder
	> = new WikiFolderAuthorizationRuleset();
	type: string = WIKI_FOLDER;
}
