import {EntityAuthorizationPolicy} from "../../types";
import Calendar from "../../domain-entities/calendar";
import {SecurityContext} from "../security-context";
import {DatabaseContext} from "../../dal/database-context";

export default class CalendarAuthorizationPolicy implements EntityAuthorizationPolicy<Calendar> {

    entity: Calendar;

    async canAdmin(context: SecurityContext, databaseContext: DatabaseContext): Promise<boolean> {
        return context.hasPermission();
    }

    async canCreate(context: SecurityContext, databaseContext: DatabaseContext): Promise<boolean> {
        return this.worldAuthorizationPolicy.canCreate(context, databaseContext);
    }

    async canRead(context: SecurityContext, databaseContext: DatabaseContext): Promise<boolean> {
        return this.worldAuthorizationPolicy.canRead(context, databaseContext);
    }

    async canWrite(context: SecurityContext, databaseContext: DatabaseContext): Promise<boolean> {
        return this.worldAuthorizationPolicy.canWrite(context);
    }

}