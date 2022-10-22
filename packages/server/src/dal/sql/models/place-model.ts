import WikiPageModel from "./wiki-page-model";
import {BelongsToGetAssociationMixin, DataTypes} from "sequelize";
import ImageModel from "./image-model";
import SqlModel from "./sql-model";
import {defaultAttributes} from "./default-attributes";


export default class PlaceModel extends SqlModel {

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
        PlaceModel.belongsTo(WikiPageModel);
        WikiPageModel.belongsTo(PlaceModel, {foreignKey: 'wiki', constraints: false});
        PlaceModel.belongsTo(ImageModel, {as: 'mapImage'});
    }
}