import { GraphqlDataloader } from "../graphql-dataloader.js";
import { WikiPage } from "../../domain-entities/wiki-page.js";
import { injectable } from "inversify";
import {Repository} from "../repository/repository.js";
import {DatabaseContext} from "../database-context.js";

@injectable()
export class WikiPageDataLoader extends GraphqlDataloader<WikiPage> {
	getRepository(databaseContext: DatabaseContext): Repository<WikiPage> {
		return databaseContext.wikiPageRepository;
	}

}
