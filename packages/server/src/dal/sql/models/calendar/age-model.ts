import SqlModel from "../sql-model.js";
import {defaultAttributes} from "../default-attributes.js";
import {DataTypes, HasManyGetAssociationsMixin, HasManySetAssociationsMixin} from "sequelize";
import MonthModel from "./month-model.js";
import DayOfTheWeekModel from "./day-of-the-week-model.js";
import {CALENDAR} from "@rpgtools/common/src/type-constants";


export default class AgeModel extends SqlModel {

    declare name: string;
    declare index: number;
    declare numYears: number;

    declare calendarId: string;

    static attributes = {
        ...defaultAttributes,
        name: {
            type: DataTypes.STRING
        },
        index: {
            type: DataTypes.INTEGER
        },
        numYears: {
            type: DataTypes.INTEGER
        },
        calendarId: {
            type: DataTypes.UUID,
            references: {
                model: CALENDAR,
                key: '_id'
            }
        }
    };

    getMonths: HasManyGetAssociationsMixin<MonthModel>;
    setMonths: HasManySetAssociationsMixin<MonthModel, string>;
    getDays: HasManyGetAssociationsMixin<DayOfTheWeekModel>;
    setDays: HasManySetAssociationsMixin<DayOfTheWeekModel, string>;

    static connect() {
        AgeModel.hasMany(MonthModel, {as: 'months', foreignKey: 'ageId', onDelete: 'CASCADE'});
        AgeModel.hasMany(DayOfTheWeekModel, {as: 'days', foreignKey: 'ageId', onDelete: 'CASCADE'});
    }
}