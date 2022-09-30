import {DataTypes, Model, Sequelize} from "sequelize";
import {defaultAttributes} from "../default-attributes";
import SqlModel from "../sql-model";


export default class CharacterAttributeModel extends SqlModel {

    declare name: string;
    declare value: number;

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