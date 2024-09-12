import {EntityFactory} from "../../../types";
import {DayOfTheWeek} from "../../calendar.js";
import DayOfTheWeekModel from "../../../dal/sql/models/calendar/day-of-the-week-model.js";
import {injectable} from "inversify";


@injectable()
export default class DayOfTheWeekFactory implements EntityFactory<DayOfTheWeek, DayOfTheWeekModel> {

    build({
        _id,
        name
    }:{
        _id?: string,
        name: string
    }): DayOfTheWeek {
        const dayOfTheWeek = new DayOfTheWeek();
        dayOfTheWeek._id = _id;
        dayOfTheWeek.name = name;
        return dayOfTheWeek;
    }

    async fromSqlModel(model: DayOfTheWeekModel): Promise<DayOfTheWeek> {
        return this.build({
            _id: model._id.toString(),
            name: model.name
        });
    }

}