import SqlModel from "../sql-model";
import {DataTypes} from "sequelize";
import {defaultAttributes} from "../default-attributes";
import {AGE} from "@rpgtools/common/src/type-constants";


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