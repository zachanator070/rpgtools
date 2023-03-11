import StrokeRepository from "../../repository/stroke-repository";
import {AbstractMongodbRepository} from "./abstract-mongodb-repository";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import StrokeFactory from "../../../domain-entities/factory/game/stroke-factory";
import {inject, injectable} from "inversify";

import mongoose from "mongoose";
import {Stroke} from "../../../domain-entities/stroke";
import {StrokeDocument, StrokeModel} from "../models/stroke";
import {FilterCondition} from "../../filter-condition";
import {PaginatedResult} from "../../paginated-result";
import {FogStroke} from "../../../domain-entities/fog-stroke";

@injectable()
export default class MongodbStrokeRepository extends AbstractMongodbRepository<Stroke, StrokeDocument> implements StrokeRepository {

    @inject(INJECTABLE_TYPES.StrokeFactory)
    entityFactory: StrokeFactory;

    model: mongoose.Model<any> = StrokeModel;

    async findAllByGameIdPaginated(id: string, page: number): Promise<PaginatedResult<Stroke>> {
        return this.findPaginated([new FilterCondition('game', id)], page);
    }

    async deleteAllByGameId(id: string): Promise<void> {
        await this.model.deleteMany({game: id});
    }

}