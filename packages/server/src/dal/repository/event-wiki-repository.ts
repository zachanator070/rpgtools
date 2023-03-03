import {Repository} from "./repository";
import {EventWiki} from "../../domain-entities/event-wiki";

export default interface EventWikiRepository extends Repository<EventWiki>{
    findByCalendarId(calendarId: string): Promise<EventWiki[]>;
}