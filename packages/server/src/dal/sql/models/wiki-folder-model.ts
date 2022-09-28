import {DataTypes, Model} from "sequelize";
import {defaultAttributes} from "./default-attributes";
import WorldModel from "./world-model";
import ArticleModel from "./article-model";
import configPermissionControlledModel from "./config-permission-controlled-model";


export default class WikiFolderModel extends Model{
    static attributes = Object.assign({}, defaultAttributes, {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    static connect() {
        WikiFolderModel.belongsTo(WorldModel, {foreignKey: 'world'});
        WikiFolderModel.belongsToMany(ArticleModel, {through: 'WikiFolderToWikiPage', constraints: false});
        WikiFolderModel.hasMany(WikiFolderModel, {foreignKey: 'parentFolder'});
        configPermissionControlledModel(WikiFolderModel);
    }
}