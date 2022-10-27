import WikiPageModel, {setupWikiPageAssociations} from "./wiki-page-model";
import {BelongsToGetAssociationMixin, DataTypes} from "sequelize";
import ImageModel from "./image-model";
import SqlModel from "./sql-model";
import {defaultAttributes} from "./default-attributes";
import WikiPageChild from "./wiki-page-child";


export default class PlaceModel extends WikiPageChild {

    declare pixelsPerFoot: number;
    declare mapImageId: string;

    static attributes = {
        ...defaultAttributes,
        pixelsPerFoot: {
            type: DataTypes.INTEGER
        }
    };

    getWikiPage: BelongsToGetAssociationMixin<WikiPageModel>;

    static connect() {
        PlaceModel.belongsTo(ImageModel, {as: 'mapImage'});
        setupWikiPageAssociations(PlaceModel, 'Place');
    }
}