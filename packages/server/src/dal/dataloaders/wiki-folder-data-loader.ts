import { GraphqlDataloader } from "../graphql-dataloader";
import { WikiFolder } from "../../domain-entities/wiki-folder";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../injectable-types";
import { WikiFolderRepository } from "../../types";
import { WikiFolderAuthorizationRuleset } from "../../security/wiki-folder-authorization-ruleset";

@injectable()
export class WikiFolderDataLoader extends GraphqlDataloader<WikiFolder> {
	@inject(INJECTABLE_TYPES.WikiFolderRepository)
	repository: WikiFolderRepository;
	@inject(INJECTABLE_TYPES.WikiFolderAuthorizationRuleset)
	ruleset: WikiFolderAuthorizationRuleset;
}
