import {AclEntry, EntityFactory} from "../../types";
import Calendar, {Age} from "../calendar.js";
import CalendarModel from "../../dal/sql/models/calendar-model.js";
import CalendarAuthorizationPolicy from "../../security/policy/calendar-authorization-policy.js";
import {inject, injectable} from "inversify";
import {INJECTABLE_TYPES} from "../../di/injectable-types.js";
import AgeFactory from "./calendar/age-factory.js";
import AclFactory from "./acl-factory.js";

@injectable()
export default class CalendarFactory implements EntityFactory<Calendar, CalendarModel> {

    @inject(INJECTABLE_TYPES.AgeFactory)
    ageFactory: AgeFactory;

    @inject(INJECTABLE_TYPES.AclFactory)
    aclFactory: AclFactory;

    build({
        _id,
        world,
        name,
        ages,
        acl
    }:{
        _id?: string,
        world: string,
        name: string,
        ages: Age[]
        acl: AclEntry[]
    }): Calendar {
        const calendar = new Calendar(new CalendarAuthorizationPolicy(), this);
        calendar._id = _id;
        calendar.world = world;
        calendar.name = name;
        calendar.ages = ages;
        calendar.acl = acl ?? [];
        return calendar;
    }

    async fromSqlModel(model?: CalendarModel): Promise<Calendar> {
        return this.build({
            _id: model._id,
            world: model.worldId,
            name: model.name,
            ages: await Promise.all((await model.getAges()).map(age => this.ageFactory.fromSqlModel(age))),
            acl: await Promise.all((await model.getAcl()).map(entry => this.aclFactory.fromSqlModel(entry)))
        })
    }

}