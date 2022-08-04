import { GraphqlDataloader } from "../graphql-dataloader";
import { File } from "../../domain-entities/file";
import {injectable } from "inversify";
import {Repository, UnitOfWork} from "../../types";

@injectable()
export class FileDataLoader extends GraphqlDataloader<File> {
	getRepository(unitOfWork: UnitOfWork): Repository<File> {
		return unitOfWork.fileRepository;
	}



}
