import {inject, injectable} from "inversify";
import {AclEntry, EntityFactory} from "../../types";
import {Monster} from "../monster";
import {WikiPageAuthorizationPolicy} from "../../security/policy/wiki-page-authorization-policy";
import {INJECTABLE_TYPES} from "../../di/injectable-types";
import AclFactory from "./acl-factory";
import WikiPageModel from "../../dal/sql/models/wiki-page-model";


@injectable()
export default class MonsterFactory implements EntityFactory<Monster, WikiPageModel> {

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
    ){
        const monster: Monster = new Monster(this, new WikiPageAuthorizationPolicy());
        monster._id = _id;
        monster.name = name;
        monster.world = world;
        monster.coverImage = coverImage;
        monster.contentId = contentId;
        monster.pageModel = pageModel;
        monster.modelColor = modelColor;
        monster.acl = acl;
        monster.relatedWikis = relatedWikis;
        return monster;
    }

    async fromSqlModel(model: WikiPageModel): Promise<Monster> {
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