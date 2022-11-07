import {DataTypes} from "sequelize";
import {defaultAttributes} from "./default-attributes";
import SqlModel from "./sql-model";
import WikiPageModel from "./wiki-page-model";
import WorldModel from "./world-model";


export default class PinModel extends SqlModel {

    declare x: number;
    declare y: number;
    declare mapId: string;
    declare pageId: string;
    declare worldId: string;

    static attributes = {
        ...defaultAttributes,
        x: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        y: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
    };

    static connect() {
        PinModel.belongsTo(WikiPageModel, {as: 'map'});
        PinModel.belongsTo(WikiPageModel, {as: 'page', constraints: false});
        PinModel.belongsTo(WorldModel, {as: 'world'});
    }
}