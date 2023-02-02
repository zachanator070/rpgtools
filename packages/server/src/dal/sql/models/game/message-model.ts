import {DataTypes, Model, Sequelize} from "sequelize";
import {defaultAttributes} from "../default-attributes";
import SqlModel from "../sql-model";


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
            type: DataTypes.STRING,
            allowNull: false
        },
        timestamp: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    };

    static connect() {
    }
}