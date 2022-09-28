import {DataTypes, Model, Sequelize} from "sequelize";
import {defaultAttributes} from "../default-attributes";
import UserModel from "../user-model";
import CharacterAttributeModel from "./character-attribute-model";


export default class CharacterModel extends Model {

    static attributes = Object.assign({}, defaultAttributes, {name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        color: {
            type: DataTypes.STRING,
            allowNull: false,
        },});

    static connect() {
        CharacterModel.belongsTo(UserModel, {foreignKey: 'player'});
        CharacterModel.hasMany(CharacterAttributeModel);
    }
}