import {DataTypes, HasManyGetAssociationsMixin, Model} from "sequelize";
import {defaultAttributes} from "../default-attributes";
import PathNodeModel from "./path-node-model";
import SqlModel from "../sql-model";


export default class FogStrokeModel extends SqlModel {

    declare size: number;
    declare type: string;

    getPath: HasManyGetAssociationsMixin<PathNodeModel>;

    static attributes = {
        ...defaultAttributes,
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
    };

    static connect() {
        FogStrokeModel.hasMany(PathNodeModel, {as: 'path', onDelete: 'CASCADE'});
    }
}