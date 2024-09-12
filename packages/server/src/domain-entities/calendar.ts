import {AclEntry, DomainEntity, EntityFactory, RepositoryAccessor} from "../types";
import CalendarAuthorizationPolicy from "../security/policy/calendar-authorization-policy.js";
import {inject, injectable} from "inversify";
import {INJECTABLE_TYPES} from "../di/injectable-types.js";
import {CALENDAR} from "@rpgtools/common/src/type-constants";
import {CalendarRepository} from "../dal/repository/calendar-repository.js";
import CalendarModel from "../dal/sql/models/calendar-model.js";

@injectable()
export default class Calendar implements DomainEntity {

    public _id: string;
    public world: string;
    public name: string;
    public ages: Age[];

    public acl: AclEntry[];

    authorizationPolicy: CalendarAuthorizationPolicy;
    factory: EntityFactory<Calendar, CalendarModel>;
    type: string = CALENDAR;

    constructor(@inject(INJECTABLE_TYPES.CalendarAuthorizationPolicy)
                    authorizationPolicy: CalendarAuthorizationPolicy,
                @inject(INJECTABLE_TYPES.CalendarFactory)
                    factory: EntityFactory<Calendar, CalendarModel>) {
        authorizationPolicy.entity = this;
        this.authorizationPolicy = authorizationPolicy;
        this.factory = factory;
    }

    getRepository(accessor: RepositoryAccessor): CalendarRepository {
        return accessor.calendarRepository;
    }

}

export class Age {
    public _id: string;
    public name: string;
    public numYears: number;
    public months: Month[];
    public daysOfTheWeek: DayOfTheWeek[];
}

export class Month {
    public _id: string;
    public name: string;
    public numDays: number;
}

export class DayOfTheWeek {
    public _id: string;
    public name: string;
}