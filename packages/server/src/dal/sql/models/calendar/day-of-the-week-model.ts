import SqlModel from "../sql-model.js";
import {DataTypes} from "sequelize";
import {defaultAttributes} from "../default-attributes.js";
import {AGE} from "@rpgtools/common/src/type-constants.js";


export default class DayOfTheWeekModel extends SqlModel {

    declare name: string;
    declare index: string;

    declare ageId: string;

    static attributes = {
        ...defaultAttributes,
        name: {
            type: DataTypes.STRING
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
    }

    static connect() {
    }
}