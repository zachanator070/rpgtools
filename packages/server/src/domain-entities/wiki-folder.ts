import { DomainEntity } from "../types";
import { WikiFolderAuthorizationRuleset } from "../security/ruleset/wiki-folder-authorization-ruleset";
import { WIKI_FOLDER } from "../../../common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";

@injectable()
export class WikiFolder implements DomainEntity {
	public _id: string;
	public name: string;
	public world: string;
	public pages: string[];
	public children: string[];

	@inject(INJECTABLE_TYPES.WikiFolderAuthorizationRuleset)
	authorizationRuleset: WikiFolderAuthorizationRuleset;

	type: string = WIKI_FOLDER;
}
