import {DataTypes, QueryInterface} from "sequelize";
import MessageModel from "../models/game/message-model";

async function up({ context: queryInterface }: {context: QueryInterface}) {
    await queryInterface.changeColumn(MessageModel.tableName, 'message', {type: DataTypes.STRING(512)});
}

async function down({ context: queryInterface }: {context: QueryInterface}) {
    await queryInterface.changeColumn(MessageModel.tableName, 'message', {type: DataTypes.STRING(255)});
}

export {up, down};