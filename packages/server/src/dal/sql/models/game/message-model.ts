import {DataTypes, Model, Sequelize} from "sequelize";
import {defaultAttributes} from "../default-attributes";


export default class MessageModel extends Model {

    static attributes = Object.assign({}, defaultAttributes, {
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
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    static connect() {
    }
}