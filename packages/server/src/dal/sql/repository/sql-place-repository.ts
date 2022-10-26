import {inject, injectable} from "inversify";
import AbstractSqlRepository from "./abstract-sql-repository";
import {Place} from "../../../domain-entities/place";
import PlaceModel from "../models/place-model";
import {PlaceRepository} from "../../repository/place-repository";
import PlaceFactory from "../../../domain-entities/factory/place-factory";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";


@injectable()
export default class SqlPlaceRepository extends AbstractSqlRepository<Place, PlaceModel> implements PlaceRepository {

    staticModel = PlaceModel;

    @inject(INJECTABLE_TYPES.PlaceFactory)
    entityFactory: PlaceFactory;
    async modelFactory(entity: Place | undefined): Promise<PlaceModel> {
        return PlaceModel.build({
            _id: entity._id,
            name: entity.name,
            contentId: entity.contentId,
            worldId: entity.world,
            type: entity.type,
            coverImageId: entity.coverImage,
            pixelsPerFoot: entity.pixelsPerFoot,
            mapImageId: entity.mapImage
        });
    }

}