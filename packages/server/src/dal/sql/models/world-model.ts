import {DataTypes, Model, Sequelize} from "sequelize";
import {defaultAttributes} from "./default-attributes";
import ArticleModel from "./article-model";
import WikiFolderModel from "./wiki-folder-model";
import configPermissionControlledModel from "./config-permission-controlled-model";


export default class WorldModel extends Model {
    static attributes = Object.assign({}, defaultAttributes, {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
    });
    
    static connect() {
        WorldModel.belongsTo(ArticleModel, {foreignKey: 'wikiPage', constraints: false});
        WorldModel.belongsTo(WikiFolderModel, {foreignKey: 'rootFolder'});
        configPermissionControlledModel(WorldModel);
    }
}