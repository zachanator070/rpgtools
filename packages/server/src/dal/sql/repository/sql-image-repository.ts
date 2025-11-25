import {inject, injectable} from "inversify";
import AbstractSqlRepository from "./abstract-sql-repository.js";
import {Image} from "../../../domain-entities/image.js";
import ImageModel from "../models/image-model.js";
import {ImageRepository} from "../../repository/image-repository.js";
import {INJECTABLE_TYPES} from "../../../di/injectable-types.js";
import ImageFactory from "../../../domain-entities/factory/image-factory.js";
import ChunkModel from "../models/chunk-model.js";


@injectable()
export default class SqlImageRepository extends AbstractSqlRepository<Image, ImageModel> implements ImageRepository {

    staticModel = ImageModel;

    @inject(INJECTABLE_TYPES.ImageFactory)
    entityFactory: ImageFactory;

    async modelFactory(entity: Image | undefined): Promise<ImageModel> {
        return ImageModel.build({
            _id: entity._id,
            width: entity.width,
            height: entity.height,
            chunkWidth: entity.chunkWidth,
            chunkHeight: entity.chunkHeight,
            name: entity.name,
            iconId: entity.icon,
            worldId: entity.world
        });
    }

    async updateAssociations(entity: Image, model: ImageModel) {
        const chunkModels = await ChunkModel.findAll({where: {_id: entity.chunks}});
        await model.setChunks(chunkModels);
    }

}