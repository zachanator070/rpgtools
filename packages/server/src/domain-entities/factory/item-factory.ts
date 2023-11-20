import {inject, injectable} from "inversify";
import {AclEntry, EntityFactory} from "../../types";
import {Item} from "../item";
import {ItemDocument} from "../../dal/mongodb/models/item";
import {WikiPageAuthorizationPolicy} from "../../security/policy/wiki-page-authorization-policy";
import {INJECTABLE_TYPES} from "../../di/injectable-types";
import AclFactory from "./acl-factory";
import ItemModel from "../../dal/sql/models/item-model";
import WikiPageModel from "../../dal/sql/models/wiki-page-model";

@injectable()
export default class ItemFactory implements EntityFactory<Item, ItemDocument, WikiPageModel> {

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
            acl,
            relatedWikis
        }: {
            _id?: string,
            name: string,
            world: string,
            coverImage: string,
            contentId: string,
            pageModel: string,
            modelColor: string,
            acl: AclEntry[],
            relatedWikis: string[]
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
        item.relatedWikis = relatedWikis;
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
        acl,
        relatedWikis
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
        item.relatedWikis = relatedWikis.map(_id => _id.toString());
        return item;
    }

    async fromSqlModel(model: WikiPageModel): Promise<Item> {
        const page = await model.getWiki();
        return this.build({
            _id: model._id,
            name: model.name,
            world: model.worldId,
            coverImage: model.coverImageId,
            contentId: model.contentId,
            pageModel: page?.pageModelId,
            modelColor: page?.modelColor,
            acl: await Promise.all(
                (await model.getAcl()).map(entry => this.aclFactory.fromSqlModel(entry))
            ),
            relatedWikis: (await Promise.all((await model.getRelatedWikis()).map(wiki => wiki._id)))
        });
    }

}