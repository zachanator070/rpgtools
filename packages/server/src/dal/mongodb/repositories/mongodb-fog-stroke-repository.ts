import {AbstractMongodbRepository} from "./abstract-mongodb-repository";
import {FogStroke} from "../../../domain-entities/fog-stroke";
import {FogStrokeDocument, FogStrokeModel} from "../models/fog-stroke";
import FogStrokeRepository from "../../repository/fog-stroke-repository";
import FogStrokeFactory from "../../../domain-entities/factory/game/fog-stroke-factory";
import {inject, injectable} from "inversify";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import mongoose from "mongoose";
import {FilterCondition} from "../../filter-condition";
import {PaginatedResult} from "../../paginated-result";

@injectable()
export default class MongodbFogStrokeRepository extends AbstractMongodbRepository<FogStroke, FogStrokeDocument> implements FogStrokeRepository {

    @inject(INJECTABLE_TYPES.FogStrokeFactory)
    entityFactory: FogStrokeFactory;

    model: mongoose.Model<any> = FogStrokeModel;

    async findAllByGameIdPaginated(id: string, page: number): Promise<PaginatedResult<FogStroke>> {
        return this.findPaginated([new FilterCondition('game', id)], page);
    }

    async deleteAllByGameId(id: string): Promise<void> {
        await this.model.deleteMany({game: id});
    }

}