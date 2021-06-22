import { GraphqlDataloader } from "../graphql-dataloader";
import { WikiFolder } from "../../domain-entities/wiki-folder";
import { inject } from "inversify";
import { INJECTABLE_TYPES } from "../../injectable-types";
import { WikiFolderRepository } from "../../types";
import { WikiFolderAuthorizationRuleset } from "../../security/wiki-folder-authorization-ruleset";

export class WikiFolderDataLoader extends GraphqlDataloader<WikiFolder> {
	constructor(@inject(INJECTABLE_TYPES.WikiFolderRepository) repo: WikiFolderRepository) {
		super(repo, new WikiFolderAuthorizationRuleset());
	}
}
