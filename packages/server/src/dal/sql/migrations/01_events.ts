import {QueryInterface} from "sequelize";
import EventWikiModel from "../models/event-wiki-model";
import {AGE, CALENDAR, DAY_OF_THE_WEEK, EVENT_WIKI, MONTH} from "@rpgtools/common/src/type-constants";
import CalendarModel from "../models/calendar-model";
import AgeModel from "../models/calendar/age-model";
import MonthModel from "../models/calendar/month-model";
import DayOfTheWeekModel from "../models/calendar/day-of-the-week-model";


async function up({ context: queryInterface }: {context: QueryInterface}) {
    await queryInterface.createTable(EVENT_WIKI, EventWikiModel.attributes);
    await queryInterface.createTable(CALENDAR, CalendarModel.attributes);
    await queryInterface.createTable(AGE, AgeModel.attributes);
    await queryInterface.createTable(MONTH, MonthModel.attributes);
    await queryInterface.createTable(DAY_OF_THE_WEEK, DayOfTheWeekModel.attributes);
}

async function down({ context: queryInterface }: {context: QueryInterface}) {
    await queryInterface.dropTable(EVENT_WIKI);
    await queryInterface.dropTable(CALENDAR);
    await queryInterface.dropTable(AGE);
    await queryInterface.dropTable(MONTH);
    await queryInterface.dropTable(DAY_OF_THE_WEEK);
}

export {up, down};