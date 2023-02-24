import {DataTypes} from "sequelize";
import {defaultAttributes} from "../default-attributes";
import SqlModel from "../sql-model";
import {CHARACTER} from "@rpgtools/common/src/type-constants";


export default class CharacterAttributeModel extends SqlModel {

    declare name: string;
    declare value: number;

    static attributes = {
        ...defaultAttributes,
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        value: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        CharacterId: {
            type: DataTypes.UUID,
            references: {
                model: CHARACTER,
                key: '_id'
            }
        }
    };

    static connect() {
    }
}