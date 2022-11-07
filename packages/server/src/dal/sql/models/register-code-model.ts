import SqlModel from "./sql-model";
import {defaultAttributes} from "./default-attributes";
import {DataTypes} from "sequelize";
import ServerConfigModel from "./server-config-model";


export default class RegisterCodeModel extends SqlModel {

    declare _id: string;
    declare code: string;
    declare serverConfigId: string;

    static attributes = {
        ...defaultAttributes,
        code: {
            type: DataTypes.STRING,
            allowNull: false
        },
    }

    static connect() {
    }
}