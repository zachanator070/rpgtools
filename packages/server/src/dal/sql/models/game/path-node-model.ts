

import {DataTypes, Model} from "sequelize";
import {defaultAttributes} from "../default-attributes";
import SqlModel from "../sql-model";


export default class PathNodeModel extends SqlModel {

    declare x: number;
    declare y: number;

    static attributes = {
        ...defaultAttributes,
        x: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        y: {
            type: DataTypes.FLOAT,
            allowNull: false
        }
    };

    static connect() {
    }
}