import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Pin } from "../../../domain-entities/pin";
import { inject, injectable } from "inversify";
import { PinFactory, PinRepository } from "../../../types";
import { Model } from "mongoose";
import { PinDocument, PinModel } from "../models/pin";
import { INJECTABLE_TYPES } from "../../../injectable-types";

@injectable()
export class MongodbPinRepository
	extends AbstractMongodbRepository<Pin, PinDocument>
	implements PinRepository
{
	@inject(INJECTABLE_TYPES.PinFactory)
	pinFactory: PinFactory;

	model: Model<any> = PinModel;

	buildEntity(document: PinDocument): Pin {
		return this.pinFactory(
			document._id.toString(),
			document.x,
			document.y,
			document.map.toString(),
			document.page ? document.page.toString() : null
		);
	}
}
