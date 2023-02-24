import {DataTypes} from "sequelize";
import {defaultAttributes} from "./default-attributes";
import FileModel from "./file-model";
import SqlModel from "./sql-model";
import {FILE, IMAGE} from "@rpgtools/common/src/type-constants";


export default class ChunkModel extends SqlModel {

    declare x: number;
    declare y: number;
    declare width: number;
    declare height: number;

    declare imageId: string;
    declare fileId: string;

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
        width: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        height: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        fileId: {
            type: DataTypes.UUID,
            references: {
                model: FILE,
                key: '_id'
            }
        },
        imageId: {
            type: DataTypes.UUID,
            references: {
                model: IMAGE,
                key: '_id'
            }
        }
    };

    static connect() {
        ChunkModel.belongsTo(FileModel, {as: 'file'});
    }
}