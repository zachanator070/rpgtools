import {DataTypes, HasManyGetAssociationsMixin, Model, Sequelize} from "sequelize";
import {defaultAttributes} from "../default-attributes";
import PathNodeModel from "./path-node-model";
import SqlModel from "../sql-model";


export default class StrokeModel extends SqlModel {

    declare color: string;
    declare size: number;
    declare fill: boolean;
    declare type: string;

    getPath: HasManyGetAssociationsMixin<PathNodeModel>;

    static attributes = {
        ...defaultAttributes,
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
    };

    static connect() {
        StrokeModel.hasMany(PathNodeModel, {as: 'path', onDelete: 'CASCADE'});
    }
}