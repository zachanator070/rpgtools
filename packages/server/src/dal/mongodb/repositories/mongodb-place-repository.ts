import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Place } from "../../../domain-entities/place";
import { inject, injectable } from "inversify";
import mongoose from "mongoose";
import {PlaceDocument, PlaceModel} from "../models/place";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";
import {PlaceRepository} from "../../repository/place-repository";
import PlaceFactory from "../../../domain-entities/factory/place-factory";

@injectable()
export class MongodbPlaceRepository
	extends AbstractMongodbRepository<Place, PlaceDocument>
	implements PlaceRepository
{
	@inject(INJECTABLE_TYPES.PlaceFactory)
	entityFactory: PlaceFactory;

	model: mongoose.Model<any> = PlaceModel;

}
