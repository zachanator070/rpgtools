import {injectable} from "inversify";
import {EntityFactory} from "../../types";
import {Chunk} from "../chunk.js";
import {ChunkAuthorizationPolicy} from "../../security/policy/chunk-authorization-policy.js";
import ChunkModel from "../../dal/sql/models/chunk-model.js";


@injectable()
export default class ChunkFactory implements EntityFactory<Chunk, ChunkModel> {
    build(
        {
            _id,
            x,
            y,
            width,
            height,
            fileId,
            image
        }: {
            _id?: string,
            x: number,
            y: number,
            width: number,
            height: number,
            fileId: string,
            image: string
        }
    ) {
        const chunk: Chunk = new Chunk(new ChunkAuthorizationPolicy(), this);
        chunk._id = _id;
        chunk.x = x;
        chunk.y = y;
        chunk.width = width;
        chunk.height = height;
        chunk.fileId = fileId;
        chunk.image = image;
        return chunk;
    }

    async fromSqlModel(model: ChunkModel): Promise<Chunk> {
        return this.build({
            _id: model._id,
            x: model.x,
            y: model.y,
            width: model.width,
            height: model.height,
            fileId: model.fileId,
            image: model.imageId
        });
    }

}