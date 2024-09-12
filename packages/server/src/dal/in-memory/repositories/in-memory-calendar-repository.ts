import {AbstractInMemoryRepository} from "./abstract-in-memory-repository.js";
import Calendar from "../../../domain-entities/calendar.js";
import {CalendarRepository} from "../../repository/calendar-repository.js";
import {injectable} from "inversify";

@injectable()
export default class InMemoryCalendarRepository extends AbstractInMemoryRepository<Calendar> implements CalendarRepository{
    async findByWorldId(worldId: string): Promise<Calendar[]> {
        return [...this.items.values()].filter(calendar => calendar.world === worldId);
    }
}