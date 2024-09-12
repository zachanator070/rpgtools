import {ChunkRepository} from "../../repository/chunk-repository.js";
import {inject, injectable} from "inversify";
import {Chunk} from "../../../domain-entities/chunk.js";
import AbstractSqlRepository from "./abstract-sql-repository.js";
import ChunkModel from "../models/chunk-model.js";
import ChunkFactory from "../../../domain-entities/factory/chunk-factory.js";
import {INJECTABLE_TYPES} from "../../../di/injectable-types.js";


@injectable()
export default class SqlChunkRepository extends AbstractSqlRepository<Chunk, ChunkModel> implements ChunkRepository {

    staticModel = ChunkModel;

    @inject(INJECTABLE_TYPES.ChunkFactory)
    entityFactory: ChunkFactory;

    async modelFactory(entity: Chunk | undefined): Promise<ChunkModel> {
        return ChunkModel.build({
            _id: entity._id,
            x: entity.x,
            y: entity.y,
            width: entity.width,
            height: entity.height,
            imageId: entity.image,
            fileId: entity.fileId,
        });
    }

}