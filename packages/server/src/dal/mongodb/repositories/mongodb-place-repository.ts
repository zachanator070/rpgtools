import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Place } from "../../../domain-entities/place";
import { injectable } from "inversify";
import { PlaceRepository } from "../../../types";
import { Model } from "mongoose";
import { PlaceDocument, PlaceModel } from "../models/place";

@injectable()
export class MongodbPlaceRepository
	extends AbstractMongodbRepository<Place, PlaceDocument>
	implements PlaceRepository {
	model: Model<any> = PlaceModel;

	buildEntity(document: PlaceDocument): Place {
		return new Place(
			document._id.toString(),
			document.name,
			document.world.toString(),
			document.coverImage.toString(),
			document.contentId.toString(),
			document.mapImage.toString(),
			document.pixelsPerFoot
		);
	}
}
