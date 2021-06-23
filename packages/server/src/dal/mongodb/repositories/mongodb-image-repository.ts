import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Image } from "../../../domain-entities/image";
import { ImageDocument, ImageModel } from "../models/image";
import { Model } from "mongoose";
import { ImageRepository } from "../../../types";
import { injectable } from "inversify";

@injectable()
export class MongodbImageRepository
	extends AbstractMongodbRepository<Image, ImageDocument>
	implements ImageRepository
{
	model: Model<any> = ImageModel;

	buildEntity(document: ImageDocument): Image {
		return new Image(
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
