import {inject, injectable} from "inversify";
import AbstractSqlRepository from "./abstract-sql-repository";
import {Pin} from "../../../domain-entities/pin";
import PinModel from "../models/pin-model";
import {PinRepository} from "../../repository/pin-repository";
import PinFactory from "../../../domain-entities/factory/pin-factory";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import {PaginatedResult} from "../../paginated-result";


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
            mapId: entity.map
        });
    }

    async findByWorldPaginated(worldId: string, page: number): Promise<PaginatedResult<Pin>> {
        return this.buildPaginatedResult(page, {worldId});
    }

    async findOneByMapAndPage(mapId: string, pageId: string): Promise<Pin> {
        return this.entityFactory.fromSqlModel(await PinModel.findOne({
            where: {
                mapId,
                pageId
            }
        }))
    }

}