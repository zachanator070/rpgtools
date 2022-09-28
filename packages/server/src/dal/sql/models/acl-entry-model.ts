import {DataTypes, Model} from "sequelize";
import {ROLE, USER} from "@rpgtools/common/src/type-constants";
import {ALL_PERMISSIONS} from "@rpgtools/common/src/permission-constants";
import {defaultAttributes} from "./default-attributes";
import UserModel from "./user-model";
import {RoleModel} from "./role-model";


export default class AclEntryModel extends Model {
    static attributes = Object.assign({}, defaultAttributes, {
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
            type: DataTypes.UUID,
            allowNull: false,
            validate: {
                isIn: {
                    args: [[USER, ROLE]],
                    msg: `principalType must be one of the following values: ${[USER, ROLE]}`
                }
            }
        }
    });

    static connect() {
        AclEntryModel.belongsTo(UserModel, {foreignKey: 'principal', constraints: false});
        AclEntryModel.belongsTo(RoleModel, {foreignKey: 'principal', constraints: false});
    }
}