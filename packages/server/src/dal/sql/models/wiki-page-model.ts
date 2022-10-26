import {BelongsToGetAssociationMixin, BelongsToManyOptions, DataTypes} from "sequelize";
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
    declare wiki: string;

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

    getWiki(options?: BelongsToManyOptions) {
        if (!this.type) return Promise.resolve(null);
        const mixinMethodName = `get${this.type}`;
        return (this as any)[mixinMethodName](options);
    }

    static connect() {
        WikiPageModel.belongsTo(WorldModel, {as: 'world',});
        WikiPageModel.belongsTo(ImageModel, {as: 'coverImage'});
        configPermissionControlledModel(WikiPageModel);
    }
}