import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Pin } from "../../../domain-entities/pin";
import { inject, injectable } from "inversify";
import { PinDocument, PinFactory, PinRepository } from "../../../types";
import mongoose from "mongoose";
import { PinModel } from "../models/pin";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";

@injectable()
export class MongodbPinRepository
	extends AbstractMongodbRepository<Pin, PinDocument>
	implements PinRepository
{
	@inject(INJECTABLE_TYPES.PinFactory)
	pinFactory: PinFactory;

	model: mongoose.Model<any> = PinModel;

	buildEntity(document: PinDocument): Pin {
		return this.pinFactory(
			{
				_id: document._id.toString(),
				x: document.x,
				y: document.y,
				map: document.map.toString(),
				page: document.page ? document.page.toString() : null
			}
		);
	}
}
