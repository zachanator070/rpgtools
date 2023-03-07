import {AbstractInMemoryRepository} from "./abstract-in-memory-repository";
import Calendar from "../../../domain-entities/calendar";
import {CalendarRepository} from "../../repository/calendar-repository";
import {injectable} from "inversify";

@injectable()
export default class InMemoryCalendarRepository extends AbstractInMemoryRepository<Calendar> implements CalendarRepository{
    async findByWorldId(worldId: string): Promise<Calendar[]> {
        return [...this.items.values()].filter(calendar => calendar.world === worldId);
    }
}