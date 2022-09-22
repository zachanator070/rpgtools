import {DataTypes, Model, Sequelize} from "sequelize";


export default class MessageModel extends Model {
    static connect(connection: Sequelize) {
        MessageModel.init({
            _id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
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
        }, {sequelize: connection});
    }
}