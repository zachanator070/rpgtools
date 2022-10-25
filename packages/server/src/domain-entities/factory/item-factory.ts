import {inject, injectable} from "inversify";
import {AclEntry, EntityFactory} from "../../types";
import {Item} from "../item";
import {ItemDocument} from "../../dal/mongodb/models/item";
import {WikiPageAuthorizationPolicy} from "../../security/policy/wiki-page-authorization-policy";
import {INJECTABLE_TYPES} from "../../di/injectable-types";
import AclFactory from "./acl-factory";
import ItemModel from "../../dal/sql/models/item-model";

@injectable()
export default class ItemFactory implements EntityFactory<Item, ItemDocument, ItemModel> {

    @inject(INJECTABLE_TYPES.AclFactory)
    aclFactory: AclFactory

    build(
        {
            _id,
            name,
            world,
            coverImage,
            contentId,
            pageModel,
            modelColor,
            acl
        }: {
            _id?: string,
            name: string,
            world: string,
            coverImage: string,
            contentId: string,
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
        item.contentId = contentId;
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
        item.acl = acl.map(entry => this.aclFactory.fromMongodbDocument(entry));
        return item;
    }

    async fromSqlModel(model: ItemModel): Promise<Item> {
        const page = await model.getWikiPage();
        return this.build({
            _id: model._id,
            name: page.name,
            world: page.worldId,
            coverImage: page.coverImageId,
            contentId: page.contentId,
            pageModel: model.pageModelId,
            modelColor: model.modelColor,
            acl: await Promise.all(
                (await (await model.getWikiPage()).getAcl()).map(entry => this.aclFactory.fromSqlModel(entry))
            )
        });
    }

}