import AbstractSqlRepository from "./abstract-sql-repository";
import Calendar, {Age} from "../../../domain-entities/calendar";
import CalendarModel from "../models/calendar-model";
import {inject, injectable} from "inversify";
import {ModelStatic} from "sequelize";
import CalendarFactory from "../../../domain-entities/factory/calendar-factory";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import SqlPermissionControlledRepository from "./sql-permission-controlled-repository";
import {CalendarRepository} from "../../repository/calendar-repository";
import {v4} from "uuid";
import AgeModel from "../models/calendar/age-model";
import MonthModel from "../models/calendar/month-model";
import DayOfTheWeekModel from "../models/calendar/day-of-the-week-model";


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
            worldId: entity.world
        });
    }

    async updateAssociations(entity: Calendar, model: CalendarModel) {
        await this.sqlPermissionControlledRepository.updateAssociations(entity, model);
        await this.updateAges(entity, model);
    }

    async updateAges(entity: Calendar, model: CalendarModel) {
        const ageModels = [];
        for(let [index, age] of entity.ages.entries()) {

            let ageModel = null;

            if(!age._id) {
                ageModel = AgeModel.build({
                    _id: age._id,
                    name: age.name,
                    numYears: age.numYears,
                    index
                });
                ageModel._id = v4();
                await ageModel.save();
                age._id = ageModel._id;
            }
            else {
                ageModel = await AgeModel.findByPk(age._id);
                await ageModel.update({
                    name: age.name,
                    numYears: age.numYears,
                    index
                });
            }
            await this.updateMonths(age, ageModel);
            await this.updateDays(age, ageModel);
            ageModels.push(ageModel);
        }

        // delete old ages
        for(let oldAgeModel of await AgeModel.findAll({where: {calendarId: entity._id}})) {
            let keep = false;
            for(let currentAgeModel of ageModels) {
                if(oldAgeModel._id === currentAgeModel._id) {
                    keep = true;
                    break;
                }
            }
            if(!keep) {
                await oldAgeModel.destroy();
            }
        }

        await model.setAges(ageModels);
    }

    async updateMonths(entity: Age, model: AgeModel) {
        // save new months
        const monthModels = [];
        for(let [index, month] of entity.months.entries()) {
            let monthModel = null;
            if (!month._id) {
                monthModel = MonthModel.build({
                    _id: month._id,
                    name: month.name,
                    numDays: month.numDays,
                    index
                });
                monthModel._id = v4();
                await monthModel.save();
                month._id = monthModel._id
            }
            else {
                monthModel = await MonthModel.findByPk(month._id);
                await monthModel.update({
                    name: month.name,
                    numDays: month.numDays,
                    index
                });
            }
            monthModels.push(monthModel);
        }

        // delete old months
        for(let oldMonthModel of await MonthModel.findAll({where: {ageId: entity._id}})) {
            let keep = false;
            for(let currentMonthModel of monthModels) {
                if(oldMonthModel._id === currentMonthModel._id) {
                    keep = true;
                    break;
                }
            }
            if(!keep) {
                await oldMonthModel.destroy();
            }
        }

        await model.setMonths(monthModels);
    }

    async updateDays(entity: Age, model: AgeModel) {
        // save new days
        const dayModels = [];
        for(let [index, day] of entity.daysOfTheWeek.entries()) {
            let dayModel = null;
            if (!day._id) {
                dayModel = DayOfTheWeekModel.build({
                    _id: day._id,
                    name: day.name,
                    index
                });
                dayModel._id = v4();
                await dayModel.save();
                day._id = dayModel._id
            }
            else {
                dayModel = await DayOfTheWeekModel.findByPk(day._id);
                await dayModel.update({
                    name: day.name,
                    index
                });
            }
            dayModels.push(dayModel);
        }

        // delete old days
        for(let oldDayModel of await DayOfTheWeekModel.findAll({where: {ageId: entity._id}})) {
            let keep = false;
            for(let currentDayModel of dayModels) {
                if(oldDayModel._id === currentDayModel._id) {
                    keep = true;
                    break;
                }
            }
            if(!keep) {
                await oldDayModel.destroy();
            }
        }

        await model.setDays(dayModels);
    }

}