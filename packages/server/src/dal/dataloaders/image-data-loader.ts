import { GraphqlDataloader } from "../graphql-dataloader.js";
import { Image } from "../../domain-entities/image.js";
import {injectable } from "inversify";
import {Repository} from "../repository/repository.js";
import {DatabaseContext} from "../database-context.js";

@injectable()
export class ImageDataLoader extends GraphqlDataloader<Image> {
	getRepository(databaseContext: DatabaseContext): Repository<Image> {
		return databaseContext.imageRepository;
	}

}
