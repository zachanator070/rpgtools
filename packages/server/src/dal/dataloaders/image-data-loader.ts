import { GraphqlDataloader } from "../graphql-dataloader";
import { Image } from "../../domain-entities/image";
import {injectable } from "inversify";
import {Repository, UnitOfWork} from "../../types";

@injectable()
export class ImageDataLoader extends GraphqlDataloader<Image> {
	getRepository(unitOfWork: UnitOfWork): Repository<Image> {
		return unitOfWork.imageRepository;
	}

}
