import { GraphqlDataloader } from "../graphql-dataloader.js";
import { File } from "../../domain-entities/file.js";
import {injectable } from "inversify";
import {Repository} from "../repository/repository.js";
import {DatabaseContext} from "../database-context.js";

@injectable()
export class FileDataLoader extends GraphqlDataloader<File> {
	getRepository(databaseContext: DatabaseContext): Repository<File> {
		return databaseContext.fileRepository;
	}



}
