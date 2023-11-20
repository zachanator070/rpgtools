import {EventWiki} from "../../../domain-entities/event-wiki";
import EventWikiRepository from "../../repository/event-wiki-repository";
import {AbstractInMemoryRepository} from "./abstract-in-memory-repository";
import {injectable} from "inversify";
import {PaginatedResult} from "../../paginated-result";
import {WikiPage} from "../../../domain-entities/wiki-page";
import {FILTER_CONDITION_OPERATOR_IN, FilterCondition} from "../../filter-condition";
import {EVENT_WIKI} from "@rpgtools/common/src/type-constants";

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