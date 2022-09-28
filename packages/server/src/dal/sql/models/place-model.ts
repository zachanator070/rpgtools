import {wikiPageAttributes} from "./config-wiki-page-model";
import {DataTypes, Model, Sequelize} from "sequelize";
import ImageModel from "./image-model";
import configWikiPageModel from "./config-wiki-page-model";

export default class PlaceModel extends Model {
    static attributes = Object.assign({}, wikiPageAttributes, {
        pixelsPerFoot: {
            type: DataTypes.INTEGER
        }
    });

    static connect() {
        configWikiPageModel(PlaceModel);
        PlaceModel.belongsTo(ImageModel, {foreignKey: 'mapImage'});
    }
}