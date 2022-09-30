import {DataTypes, ModelAttributes} from "sequelize";
import {defaultAttributes} from "./default-attributes";
import SqlModel from "./sql-model";


export default class FileModel extends SqlModel {

    declare content: string;
    declare filename: string;
    declare mimeType: string;

    static attributes: ModelAttributes = Object.assign({}, defaultAttributes, {
        content: {
            type: DataTypes.BLOB,
            allowNull: false
        },
        filename: {
            type: DataTypes.STRING,
            allowNull: false
        },
        mimeType: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    static connect() {
    }
}