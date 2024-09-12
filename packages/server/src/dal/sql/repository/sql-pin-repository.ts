import {inject, injectable} from "inversify";
import AbstractSqlRepository from "./abstract-sql-repository.js";
import {Pin} from "../../../domain-entities/pin.js";
import PinModel from "../models/pin-model.js";
import {PinRepository} from "../../repository/pin-repository.js";
import PinFactory from "../../../domain-entities/factory/pin-factory.js";
import {INJECTABLE_TYPES} from "../../../di/injectable-types.js";
import {PaginatedResult} from "../../paginated-result.js";


@injectable()
export default class SqlPinRepository extends AbstractSqlRepository<Pin, PinModel> implements PinRepository {

    @inject(INJECTABLE_TYPES.PinFactory)
    entityFactory: PinFactory;

    staticModel = PinModel;

    async modelFactory(entity: Pin | undefined): Promise<PinModel> {
        return PinModel.build({
            _id: entity._id,
            x: entity.x,
            y: entity.y,
            pageId: entity.page,
            mapId: entity.map,
            worldId: entity.world,
        });
    }

    async findByWorldPaginated(worldId: string, page: number): Promise<PaginatedResult<Pin>> {
        return this.buildPaginatedResult(page, {worldId});
    }

    async findOneByMapAndPage(mapId: string, pageId: string): Promise<Pin> {
        const model = await PinModel.findOne({
            where: {
                mapId,
                pageId
            }
        });
        if(model) {
            return this.entityFactory.fromSqlModel(model);
        }
    }

}