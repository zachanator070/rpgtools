import {DataTypes} from "sequelize";
import {ROLE, USER} from "@rpgtools/common/src/type-constants.js";
import {ALL_PERMISSIONS} from "@rpgtools/common/src/permission-constants.js";
import {defaultAttributes} from "./default-attributes.js";
import UserModel from "./user-model.js";
import {RoleModel} from "./role-model.js";
import SqlModel from "./sql-model.js";


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