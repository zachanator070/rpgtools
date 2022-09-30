import {injectable} from "inversify";
import {EntityFactory} from "../../types";
import {Image} from "../image";
import {ImageDocument} from "../../dal/mongodb/models/image";
import {ObjectId} from "mongoose";
import {ImageAuthorizationPolicy} from "../../security/policy/image-authorization-policy";
import ImageModel from "../../dal/sql/models/image-model";

@injectable()
export default class ImageFactory implements EntityFactory<Image, ImageDocument, ImageModel> {
    build(
        {
            _id,
            name,
            world,
            width,
            height,
            chunkWidth,
            chunkHeight,
            chunks,
            icon
        }: {
            _id: string | ObjectId,
            name: string,
            world: string | ObjectId,
            width: number,
            height: number,
            chunkWidth: number,
            chunkHeight: number,
            chunks: string[] | ObjectId[],
            icon: string | ObjectId
        }
    ) {
        const image: Image = new Image(new ImageAuthorizationPolicy(), this);
        image._id = _id && _id.toString();
        image.name = name;
        image.world = world && world.toString();
        image.width = width;
        image.height = height;
        image.chunkWidth = chunkWidth;
        image.chunkHeight = chunkHeight;
        image.chunks = chunks.map(chunk => chunk.toString());
        image.icon = icon && icon.toString();
        return image;
    }

    fromMongodbDocument({
        _id,
        name,
        world,
        width,
        height,
        chunkWidth,
        chunkHeight,
        chunks,
        icon
    }: ImageDocument): Image {
        const image = new Image(new ImageAuthorizationPolicy(), this);
        image._id = _id && _id.toString();
        image.name = name;
        image.world = world && world.toString();
        image.width = width;
        image.height = height;
        image.chunkWidth = chunkWidth;
        image.chunkHeight = chunkHeight;
        image.chunks = chunks.map(chunk => chunk.toString());
        image.icon = icon && icon.toString();
        return image;
    }

    async fromSqlModel(model: ImageModel): Promise<Image> {
        return this.build({
            _id: model._id,
            name: model.name,
            world: model.worldId,
            width: model.width,
            height: model.height,
            chunkWidth: model.chunkWidth,
            chunkHeight: model.chunkHeight,
            chunks: (await model.getChunks()).map(chunk => chunk._id),
            icon: model.iconId
        });
    }

}