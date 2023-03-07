import {inject, injectable} from "inversify";
import {AbstractMongodbRepository} from "./abstract-mongodb-repository";
import Calendar from "../../../domain-entities/calendar";
import {CalendarDocument, CalendarModel} from "../models/calendar";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import CalendarFactory from "../../../domain-entities/factory/calendar-factory";
import mongoose from "mongoose";
import {CalendarRepository} from "../../repository/calendar-repository";
import {FilterCondition} from "../../filter-condition";


@injectable()
export default class MongodbCalendarRepository extends AbstractMongodbRepository<Calendar, CalendarDocument> implements CalendarRepository {

    @inject(INJECTABLE_TYPES.CalendarFactory)
    entityFactory: CalendarFactory;

    model: mongoose.Model<any> = CalendarModel;

    async findByWorldId(worldId: string): Promise<Calendar[]> {
        return this.find([new FilterCondition('world', worldId)]);
    }

}