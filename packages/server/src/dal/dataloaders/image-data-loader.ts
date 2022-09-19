import { GraphqlDataloader } from "../graphql-dataloader";
import { Image } from "../../domain-entities/image";
import {injectable } from "inversify";
import {Repository} from "../repository/repository";
import {DatabaseContext} from "../database-context";

@injectable()
export class ImageDataLoader extends GraphqlDataloader<Image> {
	getRepository(databaseContext: DatabaseContext): Repository<Image> {
		return databaseContext.imageRepository;
	}

}
