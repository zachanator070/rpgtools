import {DataTypes, Model, Sequelize} from "sequelize";
import {defaultAttributes} from "../default-attributes";
import ModelModel from "../model-model";
import ArticleModel from "../article-model";
import SqlModel from "../sql-model";


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
        }
    };

    static connect() {
        InGameModelModel.belongsTo(ModelModel, {as: 'model'})
        InGameModelModel.belongsTo(ArticleModel, {as: 'wiki', constraints: false});
    }
}