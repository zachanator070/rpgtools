import { GraphqlDataloader } from "../graphql-dataloader";
import { WikiPage } from "../../domain-entities/wiki-page";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import { WikiPageRepository } from "../../types";
import { WikiPageAuthorizationPolicy } from "../../security/policy/wiki-page-authorization-policy";

@injectable()
export class WikiPageDataLoader extends GraphqlDataloader<WikiPage> {

	@inject(INJECTABLE_TYPES.WikiPageRepository)
	repository: WikiPageRepository;

}
