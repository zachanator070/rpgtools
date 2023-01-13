import { GraphqlDataloader } from "../graphql-dataloader";
import { WikiFolder } from "../../domain-entities/wiki-folder";
import { injectable } from "inversify";
import {Repository} from "../repository/repository";
import {DatabaseContext} from "../database-context";

@injectable()
export class WikiFolderDataLoader extends GraphqlDataloader<WikiFolder> {
	getRepository(databaseContext: DatabaseContext): Repository<WikiFolder> {
		return databaseContext.wikiFolderRepository;
	}

}
