import {DataTypes, Model, Sequelize} from "sequelize";
import {defaultAttributes} from "../default-attributes";


export default class CharacterAttributeModel extends Model {

    static attributes = Object.assign({}, defaultAttributes, {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        value: {
            type: DataTypes.FLOAT,
            allowNull: false
        }
    });

    static connect() {
    }
}