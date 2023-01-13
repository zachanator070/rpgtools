import SqlModel from "./sql-model";
import {DataTypes} from "sequelize";


export default class UserToRoleModel extends SqlModel {

    static attributes = {
        UserId: DataTypes.UUID,
        RoleId: DataTypes.UUID
    };

    static connect() {
    }

}