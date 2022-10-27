import {
    BelongsToManyGetAssociationsMixin, BelongsToManySetAssociationsMixin,
    DataTypes,
    HasManyGetAssociationsMixin,
    HasManySetAssociationsMixin
} from "sequelize";
import {defaultAttributes} from "./default-attributes";
import WorldModel from "./world-model";
import ArticleModel from "./article-model";
import PermissionControlledModel, {configPermissionControlledModel} from "./permission-controlled-model";
import WikiPageModel from "./wiki-page-model";


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
        }
    };

    static connect() {
        WikiFolderModel.belongsTo(WorldModel, {as: 'world'});
        WikiFolderModel.belongsToMany(WikiPageModel, {as: 'pages', through: 'WikiFolderToWikiPage', constraints: false});
        WikiFolderModel.hasMany(WikiFolderModel, {as: 'children'});
        configPermissionControlledModel(WikiFolderModel);
    }
}