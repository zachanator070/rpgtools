import {DataTypes} from "sequelize";
import {defaultAttributes} from "./default-attributes";
import SqlModel from "./sql-model";
import WikiPageModel from "./wiki-page-model";
import WorldModel from "./world-model";
import {WIKI_PAGE, WORLD} from "@rpgtools/common/src/type-constants";


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
        mapId: {
            type: DataTypes.UUID,
            references: {
                model: WIKI_PAGE,
                key: '_id'
            }
        },
        pageId: {
            type: DataTypes.UUID,
        },
        worldId: {
            type: DataTypes.UUID,
            references: {
                model: WORLD,
                key: '_id'
            }
        }
    };

    static connect() {
        PinModel.belongsTo(WikiPageModel, {as: 'map'});
        PinModel.belongsTo(WikiPageModel, {as: 'page', constraints: false});
        PinModel.belongsTo(WorldModel, {as: 'world'});
    }
}