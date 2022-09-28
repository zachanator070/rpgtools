import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Image } from "../../../domain-entities/image";
import {ImageDocument, ImageModel} from "../models/image";
import mongoose from "mongoose";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";
import {ImageRepository} from "../../repository/image-repository";
import ImageFactory from "../../../domain-entities/factory/image-factory";

@injectable()
export class MongodbImageRepository
	extends AbstractMongodbRepository<Image, ImageDocument>
	implements ImageRepository
{
	@inject(INJECTABLE_TYPES.ImageFactory)
	imageFactory: ImageFactory;

	model: mongoose.Model<any> = ImageModel;

}
