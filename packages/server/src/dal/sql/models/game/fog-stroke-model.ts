import {DataTypes, HasManyGetAssociationsMixin, HasManySetAssociationsMixin, Model} from "sequelize";
import {defaultAttributes} from "../default-attributes.js";
import PathNodeModel from "./path-node-model.js";
import SqlModel from "../sql-model.js";
import {GAME} from "@rpgtools/common/src/type-constants";


export default class FogStrokeModel extends SqlModel {

    declare size: number;
    declare strokeType: string;
    declare GameId: string;

    getPath: HasManyGetAssociationsMixin<PathNodeModel>;
    setPath: HasManySetAssociationsMixin<PathNodeModel, any>;

    static attributes = {
        ...defaultAttributes,
        size: {
            type: DataTypes.FLOAT,
        },
        strokeType: {
            type: DataTypes.STRING,
            validate: {
                isIn: {
                    args: [["fog", "erase"]],
                    msg: `type is not one of the following values: ${["fog", "erase"]}`
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
        FogStrokeModel.hasMany(PathNodeModel, {as: 'path', onDelete: 'CASCADE'});
    }
}