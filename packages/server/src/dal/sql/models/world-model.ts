import {DataTypes} from "sequelize";
import {defaultAttributes} from "./default-attributes";
import ArticleModel from "./article-model";
import WikiFolderModel from "./wiki-folder-model";
import PermissionControlledModel, {configPermissionControlledModel} from "./permission-controlled-model";
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