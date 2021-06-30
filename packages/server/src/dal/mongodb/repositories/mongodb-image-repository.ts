import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Image } from "../../../domain-entities/image";
import { ImageDocument, ImageModel } from "../models/image";
import { Model } from "mongoose";
import { ImageFactory, ImageRepository } from "../../../types";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../../injectable-types";

@injectable()
export class MongodbImageRepository
	extends AbstractMongodbRepository<Image, ImageDocument>
	implements ImageRepository
{
	@inject(INJECTABLE_TYPES.ImageFactory)
	imageFactory: ImageFactory;

	model: Model<any> = ImageModel;

	buildEntity(document: ImageDocument): Image {
		return this.imageFactory(
			document._id.toString(),
			document.name,
			document.world.toString(),
			document.width,
			document.height,
			document.chunkWidth,
			document.chunkHeight,
			document.chunks.map((id) => id.toString()),
			document.icon ? document.icon.toString() : null
		);
	}
}
