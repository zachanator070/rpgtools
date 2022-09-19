import { GraphqlDataloader } from "../graphql-dataloader";
import { WikiPage } from "../../domain-entities/wiki-page";
import { injectable } from "inversify";
import {Repository} from "../repository/repository";
import {DatabaseContext} from "../database-context";

@injectable()
export class WikiPageDataLoader extends GraphqlDataloader<WikiPage> {
	getRepository(databaseContext: DatabaseContext): Repository<WikiPage> {
		return databaseContext.wikiPageRepository;
	}

}
