import {DataTypes, Model, ModelAttributes, Sequelize} from "sequelize";
import {defaultAttributes} from "./default-attributes";


export default class FileModel extends Model {
    static attributes: ModelAttributes = Object.assign({}, defaultAttributes, {
        content: {
            type: DataTypes.BLOB,
            allowNull: false
        }
    });

    static connect() {
    }
}