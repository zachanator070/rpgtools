import {injectable} from "inversify";
import {EntityFactory} from "../../types";
import {Chunk} from "../chunk";
import {ChunkDocument} from "../../dal/mongodb/models/chunk";
import {ChunkAuthorizationPolicy} from "../../security/policy/chunk-authorization-policy";
import ChunkModel from "../../dal/sql/models/chunk-model";


@injectable()
export default class ChunkFactory implements EntityFactory<Chunk, ChunkDocument, ChunkModel> {
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

    fromMongodbDocument(doc: ChunkDocument): Chunk {
        const chunk = new Chunk(new ChunkAuthorizationPolicy(), this);
        chunk._id = doc._id && doc._id.toString();
        chunk.x = doc.x;
        chunk.y = doc.y;
        chunk.width = doc.width;
        chunk.height = doc.height;
        chunk.fileId = doc.fileId && doc.fileId.toString();
        chunk.image = doc.image && doc.image.toString();
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