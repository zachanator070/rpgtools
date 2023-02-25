import {AclEntry, EntityFactory} from "../../types";
import {inject, injectable} from "inversify";
import {EventDocument} from "../../dal/mongodb/models/event-wiki";
import WikiPageModel from "../../dal/sql/models/wiki-page-model";
import {INJECTABLE_TYPES} from "../../di/injectable-types";
import AclFactory from "./acl-factory";
import {WikiPageAuthorizationPolicy} from "../../security/policy/wiki-page-authorization-policy";
import {EventWiki} from "../event-wiki";


@injectable()
export default class EventWikiFactory implements EntityFactory<EventWiki, EventDocument, WikiPageModel> {
    @inject(INJECTABLE_TYPES.AclFactory)
    aclFactory: AclFactory

    build(
        {
            _id,
            name,
            world,
            coverImage,
            contentId,
            calendar,
            age,
            year,
            month,
            day,
            hour,
            minute,
            second,
            acl
        }:{
            _id?: string,
            name: string,
            world: string,
            coverImage: string,
            contentId: string,
            calendar: string,
            age: number,
            year: number,
            month: number,
            day: number,
            hour: number,
            minute: number,
            second: number,
            acl: AclEntry[]
        }
    ) {
        const event: EventWiki = new EventWiki(this, new WikiPageAuthorizationPolicy());
        event._id = _id;
        event.name = name;
        event.world = world;
        event.coverImage = coverImage;
        event.contentId = contentId;
        event.calendar = calendar;
        event.age = age;
        event.year = year;
        event.month = month;
        event.day = day;
        event.hour = day;
        event.minute = minute;
        event.second = second;
        event.acl = acl;
        return event;
    }

    fromMongodbDocument({
        _id,
        name,
        world,
        coverImage,
        contentId,
        calendar,
        age,
        year,
        month,
        day,
        hour,
        minute,
        second,
        acl
    }: EventDocument): EventWiki {
        const event = new EventWiki(this, new WikiPageAuthorizationPolicy());
        event._id = _id && _id.toString();
        event.name = name;
        event.world = world && world.toString();
        event.coverImage = coverImage && coverImage.toString();
        event.contentId = contentId && contentId.toString();
        event.calendar = calendar;
        event.age = age;
        event.year = year;
        event.month = month;
        event.day = day;
        event.hour = day;
        event.minute = minute;
        event.second = second;
        event.acl = acl.map(entry => this.aclFactory.fromMongodbDocument(entry));
        return event;
    }

    async fromSqlModel(model: WikiPageModel): Promise<EventWiki> {
        const page = await model.getWiki();
        return this.build({
            _id: model._id,
            name: model.name,
            world: model.worldId,
            coverImage: model.coverImageId,
            contentId: model.contentId,
            calendar: page?.calendar,
            age: page?.age,
            year: page?.year,
            month: page?.month,
            day: page?.day,
            hour: page?.day,
            minute: page?.minute,
            second: page?.second,
            acl: await Promise.all(
                (await model.getAcl()).map(entry => this.aclFactory.fromSqlModel(entry))
            )
        });
    }

}