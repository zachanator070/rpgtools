import {Repository} from "./repository";
import Calendar from "../../domain-entities/calendar";


export interface CalendarRepository extends Repository<Calendar>{
    findByWorldId(worldId: string): Promise<Calendar[]>;
}