import { GraphqlDataloader } from "../graphql-dataloader";
import { WikiPage } from "../../domain-entities/wiki-page";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../injectable-types";
import { WikiPageRepository } from "../../types";
import { WikiPageAuthorizationRuleset } from "../../security/wiki-page-authorization-ruleset";

@injectable()
export class WikiPageDataLoader extends GraphqlDataloader<WikiPage> {
	@inject(INJECTABLE_TYPES.WikiPageRepository)
	repository: WikiPageRepository;
	@inject(INJECTABLE_TYPES.WikiPageAuthorizationRuleset)
	ruleset: WikiPageAuthorizationRuleset;
}
