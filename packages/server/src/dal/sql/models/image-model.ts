import {DataTypes, HasManyGetAssociationsMixin, HasManySetAssociationsMixin} from "sequelize";
import {defaultAttributes} from "./default-attributes";
import SqlModel from "./sql-model";
import ChunkModel from "./chunk-model";
import WorldModel from "./world-model";
import {IMAGE, WORLD} from "@rpgtools/common/src/type-constants";


export default class ImageModel extends SqlModel {

    declare width: number;
    declare height: number;
    declare chunkWidth: number;
    declare chunkHeight: number;
    declare name: string;
    declare iconId: string;
    declare worldId: string;

    getChunks: HasManyGetAssociationsMixin<ChunkModel>;
    setChunks: HasManySetAssociationsMixin<ChunkModel, string>;

    static attributes = {
        ...defaultAttributes,
        width: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        height: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        chunkWidth: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        chunkHeight: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        worldId: {
            type: DataTypes.UUID,
            references: {
                model: WORLD,
                key: '_id'
            }
        },
        iconId: {
            type: DataTypes.UUID,
            references: {
                model: IMAGE,
                key: '_id'
            }
        }
    };

    static connect()  {
        ImageModel.belongsTo(WorldModel, {as: 'world'});
        ImageModel.belongsTo(ImageModel, {as: 'icon'});
        ImageModel.hasMany(ChunkModel, {as: 'chunks', foreignKey: 'imageId'});
    }
}