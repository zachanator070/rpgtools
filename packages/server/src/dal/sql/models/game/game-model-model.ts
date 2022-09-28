import {DataTypes, Model, Sequelize} from "sequelize";
import {defaultAttributes} from "../default-attributes";
import ModelModel from "../model-model";
import ArticleModel from "../article-model";


export default class GameModelModel extends Model {

    static attributes = Object.assign({}, defaultAttributes, {
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
    });

    static connect() {
        GameModelModel.belongsTo(ModelModel, {foreignKey: 'model'})
        GameModelModel.belongsTo(ArticleModel, {foreignKey: 'wiki', constraints: false});
    }
}