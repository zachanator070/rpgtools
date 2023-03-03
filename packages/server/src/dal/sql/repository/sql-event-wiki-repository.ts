import AbstractSqlRepository from "./abstract-sql-repository";
import {EventWiki} from "../../../domain-entities/event-wiki";
import EventWikiModel from "../models/event-wiki-model";
import {ModelStatic} from "sequelize";
import {EntityFactory} from "../../../types";
import {inject, injectable} from "inversify";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import WikiPageModel from "../models/wiki-page-model";
import EventWikiRepository from "../../repository/event-wiki-repository";

@injectable()
export default class SqlEventWikiRepository extends AbstractSqlRepository<EventWiki, WikiPageModel> implements EventWikiRepository {

    @inject(INJECTABLE_TYPES.EventWikiFactory)
    entityFactory: EntityFactory<EventWiki, any, WikiPageModel>;

    async modelFactory(entity: EventWiki): Promise<WikiPageModel> {
        return WikiPageModel.build({
            _id: entity._id,
            name: entity.name,
            contentId: entity.contentId,
            worldId: entity.world,
            type: entity.type,
            coverImageId: entity.coverImage,
        });
    }

    staticModel: ModelStatic<any> = WikiPageModel;

    async updateAssociations(entity: EventWiki, model: WikiPageModel) {
        let page = await EventWikiModel.findOne({where: {_id: entity._id}});
        if(!page) {
            page = await EventWikiModel.create({
                _id: entity._id,
                calendar: entity.calendar,
                age: entity.age,
                year: entity.year,
                month: entity.month,
                day: entity.day,
                hour: entity.hour,
                minute: entity.minute,
                second: entity.second
            });
            model.wiki = page._id;
            await model.save();
        } else {
            page.set(entity);
            await page.save();
        }
    }

    async deleteAssociations(entity: EventWiki, model: WikiPageModel){
        await EventWikiModel.destroy({where: {_id: entity._id}});
    }

    async findByCalendarId(calendarId: string): Promise<EventWiki[]> {
        const events = await EventWikiModel.findAll({where: {calendarId}});
        const pages = await Promise.all(events.map(event => event.getWikiPage()));
        return Promise.all(pages.map((event) => this.entityFactory.fromSqlModel(event)));
    }

}