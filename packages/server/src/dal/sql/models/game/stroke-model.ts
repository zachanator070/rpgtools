import {DataTypes, HasManyGetAssociationsMixin, Model, Sequelize} from "sequelize";
import {defaultAttributes} from "../default-attributes.js";
import PathNodeModel from "./path-node-model.js";
import SqlModel from "../sql-model.js";
import {GAME} from "@rpgtools/common/src/type-constants.js";


export default class StrokeModel extends SqlModel {

    declare color: string;
    declare size: number;
    declare fill: boolean;
    declare strokeType: string;
    declare GameId: string;

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
        strokeType: {
            type: DataTypes.STRING,
            validate: {
                isIn: {
                    args: [["circle", "square", "erase", "line"]],
                    msg: `type is not one of the following values: ${["circle", "square", "erase", "line"]}`
                }
            }
        },
        GameId: {
            type: DataTypes.UUID,
            references: {
                model: GAME,
                key: '_id'
            }
        }
    };

    static connect() {
        StrokeModel.hasMany(PathNodeModel, {as: 'path', onDelete: 'CASCADE'});
    }
}