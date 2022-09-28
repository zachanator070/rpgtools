

import {DataTypes, Model} from "sequelize";
import {defaultAttributes} from "../default-attributes";


export default class PathNodeModel extends Model {

    static attributes = Object.assign({}, defaultAttributes, {
        x: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        y: {
            type: DataTypes.FLOAT,
            allowNull: false
        }
    });

    static connect() {
    }
}