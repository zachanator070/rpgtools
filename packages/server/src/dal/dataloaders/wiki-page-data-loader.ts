import { GraphqlDataloader } from "../graphql-dataloader";
import { WikiPage } from "../../domain-entities/wiki-page";
import { inject } from "inversify";
import { INJECTABLE_TYPES } from "../../injectable-types";
import { WikiPageRepository } from "../../types";
import { WikiPageAuthorizationRuleset } from "../../security/wiki-page-authorization-ruleset";

export class WikiPageDataLoader extends GraphqlDataloader<WikiPage> {
	constructor(@inject(INJECTABLE_TYPES.WikiPageRepository) repo: WikiPageRepository) {
		super(repo, new WikiPageAuthorizationRuleset());
	}
}
