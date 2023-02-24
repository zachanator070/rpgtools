import {DataTypes, HasManyGetAssociationsMixin, HasManySetAssociationsMixin, Model, Sequelize} from "sequelize";
import {defaultAttributes} from "../default-attributes";
import UserModel from "../user-model";
import CharacterAttributeModel from "./character-attribute-model";
import SqlModel from "../sql-model";
import {GAME, USER} from "@rpgtools/common/src/type-constants";


export default class CharacterModel extends SqlModel {

    declare name: string;
    declare color: string;
    declare playerId: string;

    getCharacterAttributes: HasManyGetAssociationsMixin<CharacterAttributeModel>;
    setCharacterAttributes: HasManySetAssociationsMixin<CharacterAttributeModel, string>;

    static attributes = {
        ...defaultAttributes,
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        color: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        GameId: {
            type: DataTypes.UUID,
            references: {
                model: GAME,
                key: '_id'
            }
        },
        playerId: {
            type: DataTypes.UUID,
            references: {
                model: USER,
                key: '_id'
            }
        }
    };

    static connect() {
        CharacterModel.belongsTo(UserModel, {as: 'player'});
        CharacterModel.hasMany(CharacterAttributeModel, {as: 'characterAttributes', onDelete: 'CASCADE'});
    }
}