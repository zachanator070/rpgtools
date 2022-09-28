import {DataTypes, Model, Sequelize} from "sequelize";
import {defaultAttributes} from "./default-attributes";
import ImageModel from "./image-model";
import ArticleModel from "./article-model";


export default class PinModel extends Model {
    static attributes = Object.assign({}, defaultAttributes, {
        x: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        y: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
    });

    static connect() {
        PinModel.belongsTo(ImageModel, {foreignKey: 'map'});
        PinModel.belongsTo(ArticleModel, {foreignKey: 'page', constraints: false});
    }
}