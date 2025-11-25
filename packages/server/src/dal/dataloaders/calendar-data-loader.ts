import {injectable} from "inversify";
import {GraphqlDataloader} from "../graphql-dataloader.js";
import Calendar from "../../domain-entities/calendar.js";
import {DatabaseContext} from "../database-context.js";
import {Repository} from "../repository/repository.js";


@injectable()
export default class CalendarDataLoader extends GraphqlDataloader<Calendar> {
    getRepository(databaseContext: DatabaseContext): Repository<Calendar> {
        return databaseContext.calendarRepository;
    }

}