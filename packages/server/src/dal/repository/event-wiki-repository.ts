import {Repository} from "./repository.js";
import {EventWiki} from "../../domain-entities/event-wiki.js";
import {PaginatedResult} from "../paginated-result.js";
import {WikiPage} from "../../domain-entities/wiki-page.js";

export default interface EventWikiRepository extends Repository<EventWiki>{
    findByCalendarId(calendarId: string): Promise<EventWiki[]>;
    findByWorldAndContentAndCalendar(page: number, worldId: string, contentIds?: string[], calendarIds?: string[]): Promise<PaginatedResult<WikiPage>>;
}