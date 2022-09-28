import {DataTypes, Model} from "sequelize";
import {defaultAttributes} from "./default-attributes";
import ChunkModel from "./chunk-model";


export default class ImageModel extends Model {
    static attributes = Object.assign({}, defaultAttributes, {
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
    });

    static connect()  {
        ImageModel.belongsTo(ImageModel, {foreignKey: 'icon'});
    }
}