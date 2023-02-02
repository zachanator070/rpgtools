import SqlModel from "./sql-model";
import {DataTypes} from "sequelize";


export default class UserToRoleModel extends SqlModel {

    static attributes = {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        UserId: DataTypes.UUID,
        RoleId: DataTypes.UUID
    };

    static connect() {
    }

}