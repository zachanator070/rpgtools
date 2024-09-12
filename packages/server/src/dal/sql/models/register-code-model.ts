import SqlModel from "./sql-model.js";
import {defaultAttributes} from "./default-attributes.js";
import {DataTypes} from "sequelize";
import ServerConfigModel from "./server-config-model.js";
import {SERVER_CONFIG} from "@rpgtools/common/src/type-constants";


export default class RegisterCodeModel extends SqlModel {

    declare _id: string;
    declare code: string;

    static attributes = {
        ...defaultAttributes,
        code: {
            type: DataTypes.STRING,
            allowNull: false
        },
        ServerConfigId: {
            type: DataTypes.UUID,
            references: {
                model: SERVER_CONFIG,
                key: '_id'
            }
        }
    }

    static connect() {
    }
}