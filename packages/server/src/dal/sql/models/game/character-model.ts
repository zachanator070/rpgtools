import {DataTypes, HasManyGetAssociationsMixin, Model, Sequelize} from "sequelize";
import {defaultAttributes} from "../default-attributes";
import UserModel from "../user-model";
import CharacterAttributeModel from "./character-attribute-model";
import SqlModel from "../sql-model";


export default class CharacterModel extends SqlModel {

    declare name: string;
    declare color: string;
    declare playerId: string;

    getAttributes: HasManyGetAssociationsMixin<CharacterAttributeModel>;

    static attributes = Object.assign({}, defaultAttributes, {name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        color: {
            type: DataTypes.STRING,
            allowNull: false,
        },});

    static connect() {
        CharacterModel.belongsTo(UserModel, {as: 'player'});
        CharacterModel.hasMany(CharacterAttributeModel, {as: 'attributes'});
    }
}