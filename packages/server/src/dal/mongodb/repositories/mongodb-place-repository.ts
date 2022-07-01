import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Place } from "../../../domain-entities/place";
import { inject, injectable } from "inversify";
import { PlaceDocument, PlaceFactory, PlaceRepository } from "../../../types";
import mongoose from "mongoose";
import { PlaceModel } from "../models/place";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";

@injectable()
export class MongodbPlaceRepository
	extends AbstractMongodbRepository<Place, PlaceDocument>
	implements PlaceRepository
{
	@inject(INJECTABLE_TYPES.PlaceFactory)
	placeFactory: PlaceFactory;

	model: mongoose.Model<any> = PlaceModel;

	buildEntity(document: PlaceDocument): Place {
		return this.placeFactory(
			document._id.toString(),
			document.name,
			document.world.toString(),
			document.coverImage ? document.coverImage.toString() : null,
			document.contentId ? document.contentId.toString() : null,
			document.mapImage ? document.mapImage.toString() : null,
			document.pixelsPerFoot
		);
	}
}
