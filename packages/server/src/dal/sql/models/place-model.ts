import WikiPageModel, {configWikiPageModel, wikiPageAttributes} from "./wiki-page-model";
import {DataTypes} from "sequelize";
import ImageModel from "./image-model";


export default class PlaceModel extends WikiPageModel {

    declare pixelsPerFoot: number;
    declare mapImageId: string;

    static attributes = Object.assign({}, wikiPageAttributes, {
        pixelsPerFoot: {
            type: DataTypes.INTEGER
        }
    });

    static connect() {
        configWikiPageModel(PlaceModel);
        PlaceModel.belongsTo(ImageModel, {as: 'mapImage'});
    }
}