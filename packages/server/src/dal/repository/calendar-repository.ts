import {Repository} from "./repository.js";
import Calendar from "../../domain-entities/calendar.js";


export interface CalendarRepository extends Repository<Calendar>{
    findByWorldId(worldId: string): Promise<Calendar[]>;
}