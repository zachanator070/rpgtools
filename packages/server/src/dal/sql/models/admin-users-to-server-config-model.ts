import SqlModel from "./sql-model.js";
import {DataTypes} from "sequelize";

export default class AdminUsersToServerConfigModel extends SqlModel {
    static attributes = {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        ServerConfigId: {
            type: DataTypes.UUID
        },
        UserId: {
            type: DataTypes.UUID
        },
        createdAt: {
            type: DataTypes.TIME
        },
        updatedAt: {
            type: DataTypes.TIME
        }
    };
}