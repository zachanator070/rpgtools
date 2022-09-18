import { GraphqlDataloader } from "../graphql-dataloader";
import { WikiFolder } from "../../domain-entities/wiki-folder";
import { injectable } from "inversify";
import {UnitOfWork} from "../../types";
import {Repository} from "../repository/repository";

@injectable()
export class WikiFolderDataLoader extends GraphqlDataloader<WikiFolder> {
	getRepository(unitOfWork: UnitOfWork): Repository<WikiFolder> {
		return unitOfWork.wikiFolderRepository;
	}

}
