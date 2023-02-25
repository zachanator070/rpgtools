import AbstractSqlRepository from "./abstract-sql-repository";
import Calendar from "../../../domain-entities/calendar";
import CalendarModel from "../models/calendar-model";
import {inject, injectable} from "inversify";
import {ModelStatic} from "sequelize";
import CalendarFactory from "../../../domain-entities/factory/calendar-factory";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import SqlPermissionControlledRepository from "./sql-permission-controlled-repository";
import {CalendarRepository} from "../../repository/calendar-repository";


@injectable()
export default class SqlCalendarRepository extends AbstractSqlRepository<Calendar, CalendarModel> implements CalendarRepository {

    @inject(INJECTABLE_TYPES.CalendarFactory)
    entityFactory: CalendarFactory;

    @inject(INJECTABLE_TYPES.SqlPermissionControlledRepository)
    sqlPermissionControlledRepository: SqlPermissionControlledRepository;

    staticModel: ModelStatic<any> = CalendarModel;

    async modelFactory(entity: Calendar | undefined): Promise<CalendarModel> {
        return CalendarModel.build({
            _id: entity._id,
            name: entity.name,
        });
    }

    async updateAssociations(entity: Calendar, model: CalendarModel) {
        await this.sqlPermissionControlledRepository.updateAssociations(entity, model);


    }

}