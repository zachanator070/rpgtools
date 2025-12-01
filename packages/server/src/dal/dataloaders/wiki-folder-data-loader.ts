import { GraphqlDataloader } from "../graphql-dataloader.js";
import { WikiFolder } from "../../domain-entities/wiki-folder.js";
import { injectable } from "inversify";
import {Repository} from "../repository/repository.js";
import {DatabaseContext} from "../database-context.js";

@injectable()
export class WikiFolderDataLoader extends GraphqlDataloader<WikiFolder> {
	getRepository(databaseContext: DatabaseContext): Repository<WikiFolder> {
		return databaseContext.wikiFolderRepository;
	}

}
