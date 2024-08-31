import {EntityFactory} from "../../../types";
import {Month} from "../../calendar";
import {injectable} from "inversify";
import MonthModel from "../../../dal/sql/models/calendar/month-model";


@injectable()
export default class MonthFactory implements EntityFactory<Month, MonthModel> {

    build({
        _id,
        name,
        numDays,
    }:{
        _id?: string,
        name: string,
        numDays: number,
    }): Month {
        const month = new Month();
        month._id = _id;
        month.name = name;
        month.numDays = numDays;
        return month
    }

    async fromSqlModel(model: MonthModel): Promise<Month> {
        return this.build({
            _id: model._id,
            name: model.name,
            numDays: model.numDays
        });
    }

}