import { GraphqlDataloader } from "../graphql-dataloader";
import { WikiFolder } from "../../domain-entities/wiki-folder";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import { WikiFolderRepository } from "../../types";
import { WikiFolderAuthorizationPolicy } from "../../security/policy/wiki-folder-authorization-policy";

@injectable()
export class WikiFolderDataLoader extends GraphqlDataloader<WikiFolder> {

	@inject(INJECTABLE_TYPES.WikiFolderRepository)
	repository: WikiFolderRepository;

}
