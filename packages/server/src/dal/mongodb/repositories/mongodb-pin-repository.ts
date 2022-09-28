import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Pin } from "../../../domain-entities/pin";
import { inject, injectable } from "inversify";
import mongoose from "mongoose";
import {PinDocument, PinModel} from "../models/pin";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";
import {PinRepository} from "../../repository/pin-repository";
import {PaginatedResult} from "../../paginated-result";
import {FilterCondition} from "../../filter-condition";
import PinFactory from "../../../domain-entities/factory/pin-factory";

@injectable()
export class MongodbPinRepository
	extends AbstractMongodbRepository<Pin, PinDocument>
	implements PinRepository
{
	@inject(INJECTABLE_TYPES.PinFactory)
	pinFactory: PinFactory;

	model: mongoose.Model<any> = PinModel;

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
