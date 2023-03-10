import SqlModel from "../sql-model";
import {defaultAttributes} from "../default-attributes";
import {DataTypes, HasManyGetAssociationsMixin, HasManySetAssociationsMixin} from "sequelize";
import MonthModel from "./month-model";
import DayOfTheWeekModel from "./day-of-the-week-model";
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