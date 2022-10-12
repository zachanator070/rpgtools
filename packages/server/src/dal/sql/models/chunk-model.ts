import {BelongsToGetAssociationMixin, DataTypes} from "sequelize";
import {defaultAttributes} from "./default-attributes";
import ImageModel from "./image-model";
import FileModel from "./file-model";
import WorldModel from "./world-model";
import SqlModel from "./sql-model";


export default class ChunkModel extends SqlModel {

    declare x: number;
    declare y: number;
    declare width: number;
    declare height: number;

    declare imageId: string;
    declare fileId: string;

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
        ChunkModel.belongsTo(ImageModel, {as: 'image'});
        ChunkModel.belongsTo(FileModel, {as: 'file'});
    }
}