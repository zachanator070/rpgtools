import {inject, injectable} from "inversify";
import {AclEntry, EntityFactory} from "../../types";
import {Person} from "../person.js";
import {INJECTABLE_TYPES} from "../../di/injectable-types.js";
import AclFactory from "./acl-factory.js";
import {WikiPageAuthorizationPolicy} from "../../security/policy/wiki-page-authorization-policy.js";
import WikiPageModel from "../../dal/sql/models/wiki-page-model.js";


@injectable()
export default class PersonFactory implements EntityFactory<Person, WikiPageModel> {

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
        }:{
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
        const person: Person = new Person(new WikiPageAuthorizationPolicy(), this);
        person._id = _id;
        person.name = name;
        person.world = world;
        person.coverImage = coverImage;
        person.contentId = contentId;
        person.pageModel = pageModel;
        person.modelColor = modelColor;
        person.acl = acl;
        person.relatedWikis = relatedWikis;
        return person;
    }

    async fromSqlModel(model: WikiPageModel): Promise<Person> {
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
        })
    }

}