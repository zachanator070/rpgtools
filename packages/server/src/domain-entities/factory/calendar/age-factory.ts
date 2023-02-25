import {EntityFactory} from "../../../types";
import {Age, DayOfTheWeek, Month} from "../../calendar";
import {AgeDocument, DayOfTheWeekDocument} from "../../../dal/mongodb/models/calendar";
import AgeModel from "../../../dal/sql/models/calendar/age-model";
import {inject, injectable} from "inversify";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import MonthFactory from "./month-factory";
import DayOfTheWeekModel from "../../../dal/sql/models/calendar/day-of-the-week-model";


@injectable()
export default class AgeFactory implements EntityFactory<Age, AgeDocument, AgeModel> {

    @inject(INJECTABLE_TYPES.MonthFactory)
    monthFactory: MonthFactory;

    @inject(INJECTABLE_TYPES.DayOfTheWeekFactory)
    dayOfTheWeekFactory: EntityFactory<DayOfTheWeek, DayOfTheWeekDocument, DayOfTheWeekModel>;

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

    fromMongodbDocument(doc: AgeDocument): Age {
        return this.build({
            _id: doc._id && doc._id.toString(),
            name: doc.name,
            numYears: doc.numYears,
            months: doc.months.map(month => this.monthFactory.fromMongodbDocument(month)),
            daysOfTheWeek: doc.daysOfTheWeek.map(day => this.dayOfTheWeekFactory.fromMongodbDocument(day))
        });
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