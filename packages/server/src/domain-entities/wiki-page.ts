import { DomainEntity } from "../types";
import { WikiPageAuthorizationRuleset } from "../security/wiki-page-authorization-ruleset";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../injectable-types";

@injectable()
export abstract class WikiPage implements DomainEntity {
	public _id: string;
	public name: string;
	public world: string;
	public coverImage: string | null;
	public contentId: string | null;
	public content: string | null;

	@inject(INJECTABLE_TYPES.WikiPageAuthorizationRuleset)
	authorizationRuleset: WikiPageAuthorizationRuleset;

	abstract type: string;
}
