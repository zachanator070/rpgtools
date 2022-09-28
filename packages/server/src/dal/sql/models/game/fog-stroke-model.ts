import {DataTypes, Model} from "sequelize";
import {defaultAttributes} from "../default-attributes";
import PathNodeModel from "./path-node-model";


export default class FogStrokeModel extends Model {

    static attributes = Object.assign({}, defaultAttributes, {
        size: {
            type: DataTypes.FLOAT,
        },
        type: {
            type: DataTypes.STRING,
            validate: {
                isIn: {
                    args: [["fog", "erase"]],
                    msg: `type is not one of the following values: ${["fog", "erase"]}`
                }
            }
        }
    });

    static connect() {
        FogStrokeModel.hasMany(PathNodeModel);
    }
}