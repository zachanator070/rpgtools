import {
    BelongsToManyGetAssociationsMixin,
    BelongsToManyOptions,
    BelongsToManySetAssociationsMixin,
    DataTypes,
    ModelStatic
} from "sequelize";
import {defaultAttributes} from "./default-attributes";
import PermissionControlledModel, {configPermissionControlledModel} from "./permission-controlled-model";
import WorldModel from "./world-model";
import ImageModel from "./image-model";
import {IMAGE, WORLD} from "@rpgtools/common/src/type-constants";
import WikiPageToWikiPageModel from "./wiki-page-to-wiki-page-model";

export function setupWikiPageAssociations(model: ModelStatic<any>, type: string) {
    model.hasOne(WikiPageModel, {foreignKey: 'wiki', constraints: false, scope: {type}});
    WikiPageModel.belongsTo(model, {foreignKey: 'wiki', constraints: false});
}

export default class WikiPageModel extends PermissionControlledModel {

    declare name: string;
    declare contentId: string;
    declare type: string;
    declare worldId: string;
    declare coverImageId: string;
    declare wiki: string;

    getRelatedWikis: BelongsToManyGetAssociationsMixin<WikiPageModel>;
    setRelatedWikis: BelongsToManySetAssociationsMixin<WikiPageModel, string>;

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
        },
        wiki: {
            type: DataTypes.UUID,
        },
        worldId: {
            type: DataTypes.UUID,
            references: {
                model: WORLD,
                key: '_id'
            }
        },
        coverImageId: {
            type: DataTypes.UUID,
            references: {
                model: IMAGE,
                key: '_id'
            }
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
        WikiPageModel.belongsToMany(WikiPageModel, {as: 'relatedWikis', through: WikiPageToWikiPageModel});
        configPermissionControlledModel(WikiPageModel);
    }
}
