import {inject, injectable} from "inversify";
import {AclEntry, EntityFactory} from "../../types";
import {Item} from "../item.js";
import {WikiPageAuthorizationPolicy} from "../../security/policy/wiki-page-authorization-policy.js";
import {INJECTABLE_TYPES} from "../../di/injectable-types.js";
import AclFactory from "./acl-factory.js";
import WikiPageModel from "../../dal/sql/models/wiki-page-model.js";

@injectable()
export default class ItemFactory implements EntityFactory<Item, WikiPageModel> {

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