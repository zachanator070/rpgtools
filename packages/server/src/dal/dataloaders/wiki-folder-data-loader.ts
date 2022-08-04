import { GraphqlDataloader } from "../graphql-dataloader";
import { WikiFolder } from "../../domain-entities/wiki-folder";
import { injectable } from "inversify";
import {Repository, UnitOfWork} from "../../types";

@injectable()
export class WikiFolderDataLoader extends GraphqlDataloader<WikiFolder> {
	getRepository(unitOfWork: UnitOfWork): Repository<WikiFolder> {
		return unitOfWork.wikiFolderRepository;
	}

}
