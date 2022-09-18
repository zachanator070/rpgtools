import { GraphqlDataloader } from "../graphql-dataloader";
import { WikiPage } from "../../domain-entities/wiki-page";
import { injectable } from "inversify";
import {UnitOfWork} from "../../types";
import {Repository} from "../repository/repository";

@injectable()
export class WikiPageDataLoader extends GraphqlDataloader<WikiPage> {
	getRepository(unitOfWork: UnitOfWork): Repository<WikiPage> {
		return unitOfWork.wikiPageRepository;
	}

}
