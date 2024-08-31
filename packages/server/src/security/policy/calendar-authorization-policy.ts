import {EntityAuthorizationPolicy} from "../../types";
import Calendar from "../../domain-entities/calendar";
import {SecurityContext} from "../security-context";
import {DatabaseContext} from "../../dal/database-context";
import {
    CALENDAR_ADMIN,
    CALENDAR_ADMIN_ALL,
    CALENDAR_READ,
    CALENDAR_READ_ALL, CALENDAR_RW, CALENDAR_RW_ALL
} from "@rpgtools/common/src/permission-constants";
import {injectable} from "inversify";

@injectable()
export default class CalendarAuthorizationPolicy implements EntityAuthorizationPolicy{

    entity: Calendar;

    async canAdmin(context: SecurityContext, databaseContext: DatabaseContext): Promise<boolean> {
        const world = await databaseContext.worldRepository.findOneById(this.entity.world);
        return context.hasPermission(CALENDAR_ADMIN, this.entity) ||
            context.hasPermission(CALENDAR_ADMIN_ALL, world);
    }

    async canCreate(context: SecurityContext, databaseContext: DatabaseContext): Promise<boolean> {
        const world = await databaseContext.worldRepository.findOneById(this.entity.world);
        return world.authorizationPolicy.canWrite(context);
    }

    async canRead(context: SecurityContext, databaseContext: DatabaseContext): Promise<boolean> {
        const world = await databaseContext.worldRepository.findOneById(this.entity.world);
        return context.hasPermission(CALENDAR_READ, this.entity) ||
            context.hasPermission(CALENDAR_READ_ALL, world) ||
            (await this.canWrite(context, databaseContext));
    }

    async canWrite(context: SecurityContext, databaseContext: DatabaseContext): Promise<boolean> {
        const world = await databaseContext.worldRepository.findOneById(this.entity.world);
        return context.hasPermission(CALENDAR_RW, this.entity) ||
            context.hasPermission(CALENDAR_RW_ALL, world);
    }

}