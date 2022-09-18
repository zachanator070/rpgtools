import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Pin } from "../../../domain-entities/pin";
import { inject, injectable } from "inversify";
import { PinFactory} from "../../../types";
import mongoose from "mongoose";
import {PinDocument, PinModel} from "../models/pin";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";
import {PinRepository} from "../../repository/pin-repository";
import {PaginatedResult} from "../../paginated-result";
import {FilterCondition} from "../../filter-condition";

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

	findByWorldPaginated(worldId: string, page: number = 0): Promise<PaginatedResult<Pin>> {
		return this.findPaginated([new FilterCondition('worldId', worldId)], page);
	}

	findOneByMapAndPage(mapId: string, pageId: string): Promise<Pin> {
		return this.findOne([
			new FilterCondition("map", mapId),
			new FilterCondition("page", pageId),
		]);
	}
}
