import {DataTypes} from "sequelize";
import {defaultAttributes} from "./default-attributes";
import ArticleModel from "./article-model";
import WikiFolderModel from "./wiki-folder-model";
import PermissionControlledModel, {configPermissionControlledModel} from "./permission-controlled-model";


export default class WorldModel extends PermissionControlledModel {

    declare name: string;
    declare wikiPageId: string;
    declare rootFolderId: string;

    static attributes = {
        ...defaultAttributes,
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
    };
    
    static connect() {
        WorldModel.belongsTo(ArticleModel, {as: 'wikiPage', constraints: false});
        WorldModel.belongsTo(WikiFolderModel, {as: 'rootFolder'});
        configPermissionControlledModel(WorldModel);
    }
}