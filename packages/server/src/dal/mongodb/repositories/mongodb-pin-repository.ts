import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Pin } from "../../../domain-entities/pin";
import { injectable } from "inversify";
import { PinRepository } from "../../../types";
import { Model } from "mongoose";
import { PinDocument, PinModel } from "../models/pin";

@injectable()
export class MongodbPinRepository
	extends AbstractMongodbRepository<Pin, PinDocument>
	implements PinRepository
{
	model: Model<any> = PinModel;

	buildEntity(document: PinDocument): Pin {
		return new Pin(
			document._id.toString(),
			document.x,
			document.y,
			document.map.toString(),
			document.page ? document.page.toString() : null
		);
	}
}
