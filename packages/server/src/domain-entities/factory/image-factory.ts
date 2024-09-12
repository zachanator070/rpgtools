import {injectable} from "inversify";
import {EntityFactory} from "../../types";
import {Image} from "../image.js";
import {ImageAuthorizationPolicy} from "../../security/policy/image-authorization-policy.js";
import ImageModel from "../../dal/sql/models/image-model.js";

@injectable()
export default class ImageFactory implements EntityFactory<Image, ImageModel> {
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
            _id?: string,
            name: string,
            world: string,
            width: number,
            height: number,
            chunkWidth: number,
            chunkHeight: number,
            chunks: string[],
            icon: string
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