import { GraphqlDataloader } from "../graphql-dataloader";
import { File } from "../../domain-entities/file";
import {injectable } from "inversify";
import {Repository} from "../repository/repository";
import {DatabaseContext} from "../database-context";

@injectable()
export class FileDataLoader extends GraphqlDataloader<File> {
	getRepository(databaseContext: DatabaseContext): Repository<File> {
		return databaseContext.fileRepository;
	}



}
