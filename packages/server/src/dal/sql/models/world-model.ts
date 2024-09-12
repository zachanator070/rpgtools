import {DataTypes} from "sequelize";
import {defaultAttributes} from "./default-attributes.js";
import ArticleModel from "./article-model.js";
import WikiFolderModel from "./wiki-folder-model.js";
import PermissionControlledModel, {configPermissionControlledModel} from "./permission-controlled-model.js";
import {WIKI_FOLDER} from "@rpgtools/common/src/type-constants";


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
        wikiPageId: {
            type: DataTypes.UUID,
        },
        rootFolderId: {
            type: DataTypes.UUID,
            references: {
                model: WIKI_FOLDER,
                key: '_id'
            }
        }
    };
    
    static connect() {
        WorldModel.belongsTo(ArticleModel, {as: 'wikiPage', constraints: false});
        WorldModel.belongsTo(WikiFolderModel, {as: 'rootFolder'});
        configPermissionControlledModel(WorldModel);
    }
}