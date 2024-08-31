import {EntityFactory} from "../../../types";
import {Age, DayOfTheWeek, Month} from "../../calendar";
import AgeModel from "../../../dal/sql/models/calendar/age-model";
import {inject, injectable} from "inversify";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import MonthFactory from "./month-factory";
import DayOfTheWeekModel from "../../../dal/sql/models/calendar/day-of-the-week-model";


@injectable()
export default class AgeFactory implements EntityFactory<Age, AgeModel> {

    @inject(INJECTABLE_TYPES.MonthFactory)
    monthFactory: MonthFactory;

    @inject(INJECTABLE_TYPES.DayOfTheWeekFactory)
    dayOfTheWeekFactory: EntityFactory<DayOfTheWeek, DayOfTheWeekModel>;

    build({
        _id,
        name,
        numYears,
        months,
        daysOfTheWeek
    }:{
        _id?: string,
        name: string,
        numYears: number,
        months: Month[],
        daysOfTheWeek: DayOfTheWeek[]
    }): Age {
        const age = new Age();
        age._id = _id;
        age.name = name;
        age.numYears = numYears;
        age.months = months;
        age.daysOfTheWeek = daysOfTheWeek;
        return age;
    }

    async fromSqlModel(model?: AgeModel): Promise<Age> {
        return this.build({
            _id: model._id,
            name: model.name,
            numYears: model.numYears,
            months: await Promise.all((await model.getMonths()).map(month => this.monthFactory.fromSqlModel(month))),
            daysOfTheWeek: await Promise.all((await model.getDays()).map(day => this.dayOfTheWeekFactory.fromSqlModel(day)))
        });
    }

}