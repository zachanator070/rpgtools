import {DataTypes, Model, Sequelize} from "sequelize";
import {defaultAttributes} from "./default-attributes";
import ImageModel from "./image-model";
import FileModel from "./file-model";
import WorldModel from "./world-model";


export default class ChunkModel extends Model {
    static attributes = Object.assign({}, defaultAttributes, {
        x: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        y: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        width: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        height: {
            type: DataTypes.FLOAT,
            allowNull: false
        }
    });

    static connect() {
        ChunkModel.belongsTo(ImageModel, {foreignKey: 'image'});
        ChunkModel.belongsTo(FileModel, {foreignKey: 'fileId'});
        ChunkModel.belongsTo(WorldModel, {foreignKey: 'world'});
    }
}