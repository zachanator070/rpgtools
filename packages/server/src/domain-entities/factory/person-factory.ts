import {inject, injectable} from "inversify";
import {AclEntry, EntityFactory} from "../../types";
import {Person} from "../person";
import {PersonDocument} from "../../dal/mongodb/models/person";
import {INJECTABLE_TYPES} from "../../di/injectable-types";
import AclFactory from "./acl-factory";
import {WikiPageAuthorizationPolicy} from "../../security/policy/wiki-page-authorization-policy";
import WikiPageModel from "../../dal/sql/models/wiki-page-model";


@injectable()
export default class PersonFactory implements EntityFactory<Person, PersonDocument, WikiPageModel> {

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
        }:{
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
        const person: Person = new Person(new WikiPageAuthorizationPolicy(), this);
        person._id = _id;
        person.name = name;
        person.world = world;
        person.coverImage = coverImage;
        person.contentId = contentId;
        person.pageModel = pageModel;
        person.modelColor = modelColor;
        person.acl = acl;
        return person;
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
    }: PersonDocument): Person {
        const person = new Person(new WikiPageAuthorizationPolicy(), this);
        person._id = _id && _id.toString();
        person.name = name;
        person.world = world && world.toString();
        person.coverImage = coverImage && coverImage.toString();
        person.contentId = contentId && contentId.toString();
        person.pageModel = pageModel && pageModel.toString();
        person.modelColor = modelColor;
        person.acl = acl.map(entry => this.aclFactory.fromMongodbDocument(entry));
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
            )
        })
    }

}