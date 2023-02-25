import {EntityFactory} from "../../../types";
import {DayOfTheWeek} from "../../calendar";
import {DayOfTheWeekDocument} from "../../../dal/mongodb/models/calendar";
import DayOfTheWeekModel from "../../../dal/sql/models/calendar/day-of-the-week-model";
import {injectable} from "inversify";


@injectable()
export default class DayOfTheWeekFactory implements EntityFactory<DayOfTheWeek, DayOfTheWeekDocument, DayOfTheWeekModel> {

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

    fromMongodbDocument(doc: DayOfTheWeekDocument): DayOfTheWeek {
        return this.build({
            _id: doc._id && doc._id.toString(),
            name: doc.name
        });
    }

    async fromSqlModel(model: DayOfTheWeekModel): Promise<DayOfTheWeek> {
        return this.build({
            _id: model._id.toString(),
            name: model.name
        });
    }

}