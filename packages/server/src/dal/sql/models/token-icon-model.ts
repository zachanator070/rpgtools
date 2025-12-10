import {DataTypes} from "sequelize";
import {defaultAttributes} from "./default-attributes.js";
import SqlModel from "./sql-model.js";
import WorldModel from "./world-model.js";
import ImageModel from "./image-model.js";
import {IMAGE, WORLD} from "@rpgtools/common/src/type-constants.js";


export default class TokenIconModel extends SqlModel {

    declare imageId: string;
    declare worldId: string;
    declare name: string;

    static attributes = {
        ...defaultAttributes,
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        imageId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: IMAGE,
                key: '_id'
            }
        },
        worldId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: WORLD,
                key: '_id'
            }
        }
    };

    static connect() {
        TokenIconModel.belongsTo(WorldModel, {as: 'world'});
        TokenIconModel.belongsTo(ImageModel, {as: 'image'});
    }
}
