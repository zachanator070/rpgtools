import {injectable} from "inversify";
import {GraphqlDataloader} from "../graphql-dataloader";
import Calendar from "../../domain-entities/calendar";
import {DatabaseContext} from "../database-context";
import {Repository} from "../repository/repository";


@injectable()
export default class CalendarDataLoader extends GraphqlDataloader<Calendar> {
    getRepository(databaseContext: DatabaseContext): Repository<Calendar> {
        return databaseContext.calendarRepository;
    }

}