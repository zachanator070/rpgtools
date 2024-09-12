import SqlModel from "../sql-model.js";
import {DataTypes} from "sequelize";
import {defaultAttributes} from "../default-attributes.js";
import {AGE} from "@rpgtools/common/src/type-constants";


export default class MonthModel extends SqlModel {

    declare name: string;
    declare numDays: number;
    declare index: number;
    declare ageId: string;

    static attributes = {
        ...defaultAttributes,
        name: {
            type: DataTypes.STRING
        },
        numDays: {
            type: DataTypes.INTEGER
        },
        index: {
            type: DataTypes.INTEGER
        },
        ageId: {
            type: DataTypes.UUID,
            references: {
                model: AGE,
                key: '_id'
            }
        }
    };

    static connect() {
    }
}