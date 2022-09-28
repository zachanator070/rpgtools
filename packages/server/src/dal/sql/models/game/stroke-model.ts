import {DataTypes, Model, Sequelize} from "sequelize";
import {defaultAttributes} from "../default-attributes";
import PathNodeModel from "./path-node-model";


export default class StrokeModel extends Model {

    static attributes = Object.assign({}, defaultAttributes, {
        color: {
            type: DataTypes.STRING,
        },
        size: {
            type: DataTypes.FLOAT,
        },
        fill: {
            type: DataTypes.BOOLEAN
        },
        type: {
            type: DataTypes.STRING,
            validate: {
                isIn: {
                    args: [["circle", "square", "erase", "line"]],
                    msg: `type is not one of the following values: ${["circle", "square", "erase", "line"]}`
                }
            }
        }
    });

    static connect() {
        StrokeModel.hasMany(PathNodeModel);
    }
}