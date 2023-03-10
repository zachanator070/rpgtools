import {EventWiki} from "../../../domain-entities/event-wiki";
import EventWikiRepository from "../../repository/event-wiki-repository";
import {AbstractInMemoryRepository} from "./abstract-in-memory-repository";
import {injectable} from "inversify";

@injectable()
export default class InMemoryEventWikiRepository extends AbstractInMemoryRepository<EventWiki> implements EventWikiRepository {
    async findByCalendarId(calendarId: string): Promise<EventWiki[]> {
        return [...this.items.values()].filter(event => event.calendar === calendarId);
    }
}