import {DataTypes, Model, Sequelize} from "sequelize";
import {defaultAttributes} from "../default-attributes";
import ModelModel from "../model-model";
import ArticleModel from "../article-model";
import SqlModel from "../sql-model";
import {GAME, MODEL} from "@rpgtools/common/src/type-constants";


export default class InGameModelModel extends SqlModel {

    declare x: number;
    declare z: number;
    declare lookAtX: number;
    declare lookAtZ: number;
    declare color: string;

    declare modelId: string;
    declare wikiId: string;

    static attributes = {
        ...defaultAttributes,
        x: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        z: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        lookAtX: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        lookAtZ: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        color: {
            type: DataTypes.STRING,
        },
        GameId: {
            type: DataTypes.UUID,
            references: {
                model: GAME,
                key: '_id'
            }
        },
        modelId: {
            type: DataTypes.UUID,
            references: {
                model: MODEL,
                key: '_id'
            }
        }
    };

    static connect() {
        InGameModelModel.belongsTo(ModelModel, {as: 'model'})
        InGameModelModel.belongsTo(ArticleModel, {as: 'wiki', constraints: false});
    }
}