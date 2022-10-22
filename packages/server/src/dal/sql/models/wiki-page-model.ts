import {BelongsToGetAssociationMixin, DataTypes} from "sequelize";
import {defaultAttributes} from "./default-attributes";
import PermissionControlledModel, {configPermissionControlledModel} from "./permission-controlled-model";
import WorldModel from "./world-model";
import ImageModel from "./image-model";


export default class WikiPageModel extends PermissionControlledModel {

    declare name: string;
    declare contentId: string;
    declare type: string;
    declare worldId: string;
    declare coverImageId: string;

    getWiki: BelongsToGetAssociationMixin<any>;

    static attributes = {
        ...defaultAttributes,
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        contentId: {
            type: DataTypes.UUID
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        }
    };

    static connect() {
        WikiPageModel.belongsTo(WorldModel, {as: 'world',});
        WikiPageModel.belongsTo(ImageModel, {as: 'coverImage'});
        configPermissionControlledModel(WikiPageModel);
    }
}