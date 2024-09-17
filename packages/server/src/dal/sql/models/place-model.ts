import WikiPageModel, {setupWikiPageAssociations} from "./wiki-page-model.js";
import {BelongsToGetAssociationMixin, DataTypes} from "sequelize";
import ImageModel from "./image-model.js";
import {defaultAttributes} from "./default-attributes.js";
import WikiPageChild from "./wiki-page-child.js";
import {IMAGE, PLACE} from "@rpgtools/common/src/type-constants.js";


export default class PlaceModel extends WikiPageChild {

    declare pixelsPerFoot: number;
    declare mapImageId: string;

    static attributes = {
        ...defaultAttributes,
        pixelsPerFoot: {
            type: DataTypes.INTEGER
        },
        mapImageId: {
            type: DataTypes.UUID,
            references: {
                model: IMAGE,
                key: '_id'
            }
        }
    };

    getWikiPage: BelongsToGetAssociationMixin<WikiPageModel>;

    static connect() {
        PlaceModel.belongsTo(ImageModel, {as: 'mapImage'});
        setupWikiPageAssociations(PlaceModel, PLACE);
    }
}