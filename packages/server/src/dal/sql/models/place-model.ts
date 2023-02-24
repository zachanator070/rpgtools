import WikiPageModel, {setupWikiPageAssociations} from "./wiki-page-model";
import {BelongsToGetAssociationMixin, DataTypes} from "sequelize";
import ImageModel from "./image-model";
import {defaultAttributes} from "./default-attributes";
import WikiPageChild from "./wiki-page-child";
import {IMAGE, PLACE} from "@rpgtools/common/src/type-constants";


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