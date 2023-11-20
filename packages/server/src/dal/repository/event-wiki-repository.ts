import {Repository} from "./repository";
import {EventWiki} from "../../domain-entities/event-wiki";
import {PaginatedResult} from "../paginated-result";
import {WikiPage} from "../../domain-entities/wiki-page";

export default interface EventWikiRepository extends Repository<EventWiki>{
    findByCalendarId(calendarId: string): Promise<EventWiki[]>;
    findByWorldAndContentAndCalendar(page: number, worldId: string, contentIds?: string[], calendarIds?: string[]): Promise<PaginatedResult<WikiPage>>;
}