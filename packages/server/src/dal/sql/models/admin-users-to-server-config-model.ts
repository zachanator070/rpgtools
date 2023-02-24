import SqlModel from "./sql-model";
import {DataTypes} from "sequelize";

export default class AdminUsersToServerConfigModel extends SqlModel {
    static attributes = {
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
    }
}