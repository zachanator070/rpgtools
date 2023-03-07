import {DataTypes} from "sequelize";
import {ROLE, USER} from "@rpgtools/common/src/type-constants";
import {ALL_PERMISSIONS} from "@rpgtools/common/src/permission-constants";
import {defaultAttributes} from "./default-attributes";
import UserModel from "./user-model";
import {RoleModel} from "./role-model";
import SqlModel from "./sql-model";


export default class AclEntryModel extends SqlModel {

    declare permission: string;
    declare principalType: "User" | "Role";

    declare principal: string;

    static attributes = {
        ...defaultAttributes,
        permission: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: {
                    args: [ALL_PERMISSIONS],
                    msg: `permission must be one of the following values: ${ALL_PERMISSIONS}`
                }
            }
        },
        principalType: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: {
                    args: [[USER, ROLE]],
                    msg: `principalType must be one of the following values: ${[USER, ROLE]}`
                }
            }
        },
        principal: {
            type: DataTypes.UUID
        },
        subject: {
            type: DataTypes.UUID
        }
    };

    static connect() {
        AclEntryModel.belongsTo(UserModel, {foreignKey: 'principal', constraints: false});
        AclEntryModel.belongsTo(RoleModel, {foreignKey: 'principal', constraints: false});
    }
}