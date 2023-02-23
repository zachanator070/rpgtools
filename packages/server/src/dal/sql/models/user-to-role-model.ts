import SqlModel from "./sql-model";
import {DataTypes} from "sequelize";
import {ROLE, USER} from "@rpgtools/common/src/type-constants";


export default class UserToRoleModel extends SqlModel {

    static attributes = {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        UserId: {
            type: DataTypes.UUID,
            references: {
                model: USER,
                key: '_id'
            }
        },
        RoleId: {
            type: DataTypes.UUID,
            references: {
                model: ROLE,
                key: '_id'
            }
        },
        createdAt: {
            type: DataTypes.TIME
        },
        updatedAt: {
            type: DataTypes.TIME
        }
    };

    static connect() {
    }

}