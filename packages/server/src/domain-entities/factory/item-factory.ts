import {inject, injectable} from "inversify";
import {AclEntry, EntityFactory} from "../../types";
import {Item} from "../item";
import {ItemDocument} from "../../dal/mongodb/models/item";
import {WikiPageAuthorizationPolicy} from "../../security/policy/wiki-page-authorization-policy";
import {INJECTABLE_TYPES} from "../../di/injectable-types";
import AclFactory from "./acl-factory";

@injectable()
export default class ItemFactory implements EntityFactory<Item, ItemDocument> {

    @inject(INJECTABLE_TYPES.AclFactory)
    aclFactory: AclFactory

    build(
        {
            _id,
            name,
            world,
            coverImage,
            content,
            pageModel,
            modelColor,
            acl
        }: {
            _id: string,
            name: string,
            world: string,
            coverImage: string,
            content: string,
            pageModel: string,
            modelColor: string,
            acl: AclEntry[]
        }
    ) {
        const item: Item = new Item(this, new WikiPageAuthorizationPolicy());
        item._id = _id;
        item.name = name;
        item.world = world;
        item.coverImage = coverImage;
        item.contentId = content;
        item.pageModel = pageModel;
        item.modelColor = modelColor;
        item.acl = acl;
        return item;
    }

    fromMongodbDocument({
        _id,
        name,
        world,
        coverImage,
        contentId,
        pageModel,
        modelColor,
        acl
    }: ItemDocument): Item {
        const item = new Item(this, new WikiPageAuthorizationPolicy());
        item._id = _id && _id.toString();
        item.name = name;
        item.world = world && world.toString();
        item.coverImage = coverImage && coverImage.toString();
        item.contentId = contentId && contentId.toString();
        item.pageModel = pageModel && pageModel.toString();
        item.modelColor = modelColor;
        item.acl = this.aclFactory.fromMongodbDocument(acl);
        return item;
    }

}