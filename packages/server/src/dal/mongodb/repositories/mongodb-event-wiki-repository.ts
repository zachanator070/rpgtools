import {EventWiki} from "../../../domain-entities/event-wiki";
import {AbstractMongodbRepository} from "./abstract-mongodb-repository";
import {EventDocument, EventWikiModel} from "../models/event-wiki";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import {inject} from "inversify";
import {EntityFactory} from "../../../types";
import mongoose from "mongoose";
import EventWikiRepository from "../../repository/event-wiki-repository";
import {PaginatedResult} from "../../paginated-result";
import {WikiPage} from "../../../domain-entities/wiki-page";
import {FILTER_CONDITION_OPERATOR_IN, FilterCondition} from "../../filter-condition";
import {EVENT_WIKI} from "@rpgtools/common/src/type-constants";

export default class MongodbEventWikiRepository extends AbstractMongodbRepository<EventWiki, EventDocument> implements EventWikiRepository{
    @inject(INJECTABLE_TYPES.EventWikiFactory)
    entityFactory: EntityFactory<EventWiki, EventDocument, any>;

    model: mongoose.Model<any> = EventWikiModel;

    async findByCalendarId(calendarId: string): Promise<EventWiki[]> {
        return this.model.find({calendar: calendarId});
    }

    findByWorldAndContentAndCalendar(page: number, worldId: string, contentIds?: string[], calendarIds?: string[]): Promise<PaginatedResult<WikiPage>> {

        const conditions = [
            new FilterCondition("world", worldId),
            new FilterCondition('type', EVENT_WIKI)
        ];

        if(calendarIds) {
            conditions.push(new FilterCondition('calendar', calendarIds, FILTER_CONDITION_OPERATOR_IN));
        }

        if(contentIds) {
            conditions.push(new FilterCondition('contentId', contentIds, FILTER_CONDITION_OPERATOR_IN));
        }

        return this.findPaginated(
            conditions,
            page
        );
    }
}