import {DataTypes, Model, Sequelize} from "sequelize";
import {defaultAttributes} from "../default-attributes.js";
import SqlModel from "../sql-model.js";
import {GAME} from "@rpgtools/common/src/type-constants";


export default class MessageModel extends SqlModel {

    declare sender: string;
    declare senderUser: string;
    declare receiver: string;
    declare receiverUser: string;
    declare message: string;
    declare timestamp: number;

    static attributes = {
        ...defaultAttributes,
        sender: {
            type: DataTypes.STRING,
            allowNull: false
        },
        senderUser: {
            type: DataTypes.STRING,
            allowNull: false
        },
        receiver: {
            type: DataTypes.STRING,
            allowNull: false
        },
        receiverUser: {
            type: DataTypes.STRING,
            allowNull: false
        },
        message: {
            type: DataTypes.STRING(512),
            allowNull: false
        },
        timestamp: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        GameId: {
            type: DataTypes.UUID,
            references: {
                model: GAME,
                key: '_id'
            }
        }
    };

    static connect() {
    }
}