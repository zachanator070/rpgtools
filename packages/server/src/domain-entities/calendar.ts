import {AclEntry, DomainEntity} from "../types";
import CalendarAuthorizationPolicy from "../security/policy/calendar-authorization-policy";
import CalendarFactory from "./factory/calendar-factory";
import {inject} from "inversify";
import {INJECTABLE_TYPES} from "../di/injectable-types";
import {CALENDAR} from "@rpgtools/common/src/type-constants";


export default class Calendar implements DomainEntity {

    public _id: string;
    public world: string;
    public name: string;
    public ages: Age[];

    public acl: AclEntry[];

    authorizationPolicy: CalendarAuthorizationPolicy;
    factory: CalendarFactory;
    type: string = CALENDAR;

    constructor(@inject(INJECTABLE_TYPES.CalendarAuthorizationPolicy)
                    authorizationPolicy: CalendarAuthorizationPolicy,
                @inject(INJECTABLE_TYPES.CalendarFactory)
                    factory: CalendarFactory) {
        authorizationPolicy.entity = this;
        this.authorizationPolicy = authorizationPolicy;
        this.factory = factory;
    }

    getRepository(accessor: RepositoryAccessor): Repository<DomainEntity> {
        return undefined;
    }

}

class Age {
    public _id: string;
    public name: string;
    public numYears: number;
    public months: Month[];
}

class Month {
    public _id: string;
    public name: string;
    public numDays: number;
    public daysOfTheWeek: DayOfTheWeek[];
}

class DayOfTheWeek {
    public _id: string;
    public name: string;
}