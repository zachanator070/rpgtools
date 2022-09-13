import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Image } from "../../../domain-entities/image";
import {ImageDocument, ImageModel} from "../models/image";
import mongoose from "mongoose";
import { ImageFactory, ImageRepository } from "../../../types";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";

@injectable()
export class MongodbImageRepository
	extends AbstractMongodbRepository<Image, ImageDocument>
	implements ImageRepository
{
	@inject(INJECTABLE_TYPES.ImageFactory)
	imageFactory: ImageFactory;

	model: mongoose.Model<any> = ImageModel;

	buildEntity(document: ImageDocument): Image {
		return this.imageFactory(
			{
				_id: document._id.toString(),
				name: document.name,
				world: document.world.toString(),
				width: document.width,
				height: document.height,
				chunkWidth: document.chunkWidth,
				chunkHeight: document.chunkHeight,
				chunks: document.chunks.map((id) => id.toString()),
				icon: document.icon ? document.icon.toString() : null
			}
		);
	}
}
