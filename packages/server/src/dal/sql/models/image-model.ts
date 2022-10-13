import {DataTypes, HasManyGetAssociationsMixin, Model} from "sequelize";
import {defaultAttributes} from "./default-attributes";
import SqlModel from "./sql-model";
import ChunkModel from "./chunk-model";
import WorldModel from "./world-model";


export default class ImageModel extends SqlModel {

    declare width: number;
    declare height: number;
    declare chunkWidth: number;
    declare chunkHeight: number;
    declare name: string;
    declare iconId: string;
    declare worldId: string;

    getChunks: HasManyGetAssociationsMixin<ChunkModel>;

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
        }
    };

    static connect()  {
        ImageModel.belongsTo(WorldModel, {as: 'world'});
        ImageModel.belongsTo(ImageModel, {as: 'icon'});
        ImageModel.hasMany(ChunkModel, {as: 'chunks'});
    }
}