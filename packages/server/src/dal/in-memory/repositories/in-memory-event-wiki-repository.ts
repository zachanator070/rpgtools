import {EventWiki} from "../../../domain-entities/event-wiki.js";
import EventWikiRepository from "../../repository/event-wiki-repository.js";
import {AbstractInMemoryRepository} from "./abstract-in-memory-repository.js";
import {injectable} from "inversify";
import {PaginatedResult} from "../../paginated-result.js";
import {WikiPage} from "../../../domain-entities/wiki-page.js";
import {FILTER_CONDITION_OPERATOR_IN, FilterCondition} from "../../filter-condition.js";
import {EVENT_WIKI} from "@rpgtools/common/src/type-constants.js";

@injectable()
export default class InMemoryEventWikiRepository extends AbstractInMemoryRepository<EventWiki> implements EventWikiRepository {
    async findByCalendarId(calendarId: string): Promise<EventWiki[]> {
        return [...this.items.values()].filter(event => event.calendar === calendarId);
    }

    findByWorldAndContentAndCalendar(page: number, worldId: string, contentIds?: string[], calendarIds?: string[]): Promise<PaginatedResult<WikiPage>> {
        const conditions = [new FilterCondition('world', worldId), new FilterCondition('type', EVENT_WIKI)];
        if(contentIds && contentIds.length > 0) {
            conditions.push(new FilterCondition('contentId', contentIds, FILTER_CONDITION_OPERATOR_IN));
        }
        if(calendarIds && calendarIds.length > 0){
            conditions.push(new FilterCondition('calendar', calendarIds, FILTER_CONDITION_OPERATOR_IN));
        }
        return this.findPaginated(conditions, page, 'name');
    }
}