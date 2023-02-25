import {AclEntry, EntityFactory} from "../../types";
import Calendar, {Age} from "../calendar";
import {CalendarDocument} from "../../dal/mongodb/models/calendar";
import CalendarModel from "../../dal/sql/models/calendar-model";
import CalendarAuthorizationPolicy from "../../security/policy/calendar-authorization-policy";
import {inject, injectable} from "inversify";
import {INJECTABLE_TYPES} from "../../di/injectable-types";
import AgeFactory from "./calendar/age-factory";
import AclFactory from "./acl-factory";

@injectable()
export default class CalendarFactory implements EntityFactory<Calendar, CalendarDocument, CalendarModel> {

    @inject(INJECTABLE_TYPES.AgeFactory)
    ageFactory: AgeFactory;

    @inject(INJECTABLE_TYPES.AclFactory)
    aclFactory: AclFactory;

    build({
        _id,
        name,
        ages,
        acl
    }:{
        _id?: string,
        name: string,
        ages: Age[]
        acl: AclEntry[]
    }): Calendar {
        const calendar = new Calendar(new CalendarAuthorizationPolicy(), this);
        calendar._id = _id;
        calendar.name = name;
        calendar.ages = ages;
        calendar.acl = acl;
        return calendar;
    }

    fromMongodbDocument(doc: CalendarDocument): Calendar {
        return this.build({
            _id: doc._id && doc._id.toString(),
            name: doc.name,
            ages: doc.ages.map(age => this.ageFactory.fromMongodbDocument(age)),
            acl: doc.acl.map(entry => this.aclFactory.fromMongodbDocument(entry))
        })
    }

    async fromSqlModel(model?: CalendarModel): Promise<Calendar> {
        return this.build({
            _id: model._id,
            name: model.name,
            ages: await Promise.all((await model.getAges()).map(age => this.ageFactory.fromSqlModel(age))),
            acl: await Promise.all((await model.getAcl()).map(entry => this.aclFactory.fromSqlModel(entry)))
        })
    }

}