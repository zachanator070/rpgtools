import {
    BelongsToManyGetAssociationsMixin, BelongsToManySetAssociationsMixin,
    DataTypes,
    HasManyGetAssociationsMixin,
    HasManySetAssociationsMixin
} from "sequelize";
import {defaultAttributes} from "./default-attributes.js";
import WorldModel from "./world-model.js";
import PermissionControlledModel, {configPermissionControlledModel} from "./permission-controlled-model.js";
import WikiPageModel from "./wiki-page-model.js";
import {WIKI_FOLDER, WORLD} from "@rpgtools/common/src/type-constants.js";
import WikiFolderToWikiPageModel from "./wiki-folder-to-wiki-page-model.js";


export default class WikiFolderModel extends PermissionControlledModel {

    declare name: string;
    declare worldId: string;

    getPages: BelongsToManyGetAssociationsMixin<WikiPageModel>;
    setPages: BelongsToManySetAssociationsMixin<WikiPageModel, string>;
    getChildren: HasManyGetAssociationsMixin<WikiFolderModel>;
    setChildren: HasManySetAssociationsMixin<WikiFolderModel, string>;

    static attributes = {
        ...defaultAttributes,
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        WikiFolderId: {
            type: DataTypes.UUID,
            references: {
                model: WIKI_FOLDER,
                key: '_id'
            }
        },
        worldId: {
            type: DataTypes.UUID,
            references: {
                model: WORLD,
                key: '_id'
            }
        }
    };

    static connect() {
        WikiFolderModel.belongsTo(WorldModel, {as: 'world'});
        WikiFolderModel.belongsToMany(WikiPageModel, {as: 'pages', through: WikiFolderToWikiPageModel, constraints: false});
        WikiFolderModel.hasMany(WikiFolderModel, {as: 'children'});
        configPermissionControlledModel(WikiFolderModel);
    }
}