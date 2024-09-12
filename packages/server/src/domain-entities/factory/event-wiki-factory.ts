import {AclEntry, EntityFactory} from "../../types";
import {inject, injectable} from "inversify";
import WikiPageModel from "../../dal/sql/models/wiki-page-model.js";
import {INJECTABLE_TYPES} from "../../di/injectable-types.js";
import AclFactory from "./acl-factory.js";
import {WikiPageAuthorizationPolicy} from "../../security/policy/wiki-page-authorization-policy.js";
import {EventWiki} from "../event-wiki.js";
import EventWikiModel from "../../dal/sql/models/event-wiki-model.js";


@injectable()
export default class EventWikiFactory implements EntityFactory<EventWiki, WikiPageModel> {
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
            acl,
            relatedWikis
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
            acl: AclEntry[],
            relatedWikis: string []
        }
    ) {
        const event: EventWiki = new EventWiki(this, new WikiPageAuthorizationPolicy());
        event._id = _id;
        event.name = name;
        event.world = world;
        event.coverImage = coverImage;
        event.contentId = contentId;
        event.calendar = calendar;
        event.age = age || 1;
        event.year = year || 1;
        event.month = month || 1;
        event.day = day || 1;
        event.hour = hour || 0;
        event.minute = minute || 0;
        event.second = second || 0;
        event.acl = acl;
        event.relatedWikis = relatedWikis;
        return event;
    }

    async fromSqlModel(model: WikiPageModel): Promise<EventWiki> {
        const page = await model.getWiki() as EventWikiModel;
        return this.build({
            _id: model._id,
            name: model.name,
            world: model.worldId,
            coverImage: model.coverImageId,
            contentId: model.contentId,
            calendar: page?.calendarId,
            age: page?.age,
            year: page?.year,
            month: page?.month,
            day: page?.day,
            hour: page?.hour,
            minute: page?.minute,
            second: page?.second,
            acl: await Promise.all(
                (await model.getAcl()).map(entry => this.aclFactory.fromSqlModel(entry))
            ),
            relatedWikis: (await Promise.all((await model.getRelatedWikis()).map(wiki => wiki._id)))
        });
    }

}