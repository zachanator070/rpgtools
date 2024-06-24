import AbstractSqlRepository from "./abstract-sql-repository";
import {EventWiki} from "../../../domain-entities/event-wiki";
import EventWikiModel from "../models/event-wiki-model";
import {ModelStatic, Op} from "sequelize";
import {EntityFactory} from "../../../types";
import {inject, injectable} from "inversify";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import WikiPageModel from "../models/wiki-page-model";
import EventWikiRepository from "../../repository/event-wiki-repository";
import {PaginatedResult} from "../../paginated-result";
import {WikiPage} from "../../../domain-entities/wiki-page";
import {EVENT_WIKI} from "@rpgtools/common/src/type-constants";
import WikiPageToWikiPageModel from "../models/wiki-page-to-wiki-page-model";

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
                calendarId: entity.calendar,
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
            page.set({
                _id: entity._id,
                calendarId: entity.calendar,
                age: entity.age,
                year: entity.year,
                month: entity.month,
                day: entity.day,
                hour: entity.hour,
                minute: entity.minute,
                second: entity.second
            });
            await page.save();
        }
        if (entity.relatedWikis) {
            const relatedWikiModels = await WikiPageModel.findAll({where: {_id: entity.relatedWikis}});
            await model.setRelatedWikis(relatedWikiModels);
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

    async findByWorldAndContentAndCalendar(page: number, worldId: string, contentIds?: string[], calendarIds?: string[]): Promise<PaginatedResult<WikiPage>> {
        const baseFilter: any = {worldId: worldId, type: EVENT_WIKI};
        const includes: any[] = [];
        if(calendarIds && calendarIds.length > 0) {
            includes.push({
                model: EventWikiModel,
                where: {
                    calendarId: calendarIds
                }
            })
        }
        if(contentIds && contentIds.length > 0) {
            includes.push({
                model: WikiPageModel,
                as: 'relatedWikis',
                duplicating: false,
                required: true
            });
            baseFilter['$relatedWikis._id$'] = {
                [Op.in]: contentIds
            };
        }

        const queryOptions = {
            where: baseFilter,
            limit: this.PAGE_LIMIT,
            offset: (page - 1) * this.PAGE_LIMIT,
            include: includes
        };

        const results = await WikiPageModel.findAll(queryOptions);

        const count = await WikiPageModel.count(queryOptions);

        return this.buildPaginatedResult(page, baseFilter, 'name', results, count);
    }
}
