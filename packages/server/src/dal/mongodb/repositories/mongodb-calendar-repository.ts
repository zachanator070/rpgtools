import {inject, injectable} from "inversify";
import {AbstractMongodbRepository} from "./abstract-mongodb-repository";
import Calendar from "../../../domain-entities/calendar";
import {CalendarDocument, CalendarModel} from "../models/calendar";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import CalendarFactory from "../../../domain-entities/factory/calendar-factory";
import mongoose from "mongoose";
import {CalendarRepository} from "../../repository/calendar-repository";
import {FilterCondition} from "../../filter-condition";
import {ObjectId} from "bson";


@injectable()
export default class MongodbCalendarRepository extends AbstractMongodbRepository<Calendar, CalendarDocument> implements CalendarRepository {

    @inject(INJECTABLE_TYPES.CalendarFactory)
    entityFactory: CalendarFactory;

    model: mongoose.Model<any> = CalendarModel;

    async findByWorldId(worldId: string): Promise<Calendar[]> {
        return this.find([new FilterCondition('world', worldId)]);
    }

    hydrateEmbeddedIds(entity: Calendar) {
        for(let age of entity.ages) {
            if(!age._id) {
                age._id = (new ObjectId()).toString();
            }
            for(let month of age.months) {
                if(!month._id) {
                    month._id = (new ObjectId()).toString();
                }
            }
            for(let day of age.daysOfTheWeek) {
                if(!day._id) {
                    day._id = (new ObjectId()).toString();
                }
            }
        }
    }

}