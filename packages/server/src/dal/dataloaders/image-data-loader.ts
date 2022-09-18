import { GraphqlDataloader } from "../graphql-dataloader";
import { Image } from "../../domain-entities/image";
import {injectable } from "inversify";
import {UnitOfWork} from "../../types";
import {Repository} from "../repository/repository";

@injectable()
export class ImageDataLoader extends GraphqlDataloader<Image> {
	getRepository(unitOfWork: UnitOfWork): Repository<Image> {
		return unitOfWork.imageRepository;
	}

}
