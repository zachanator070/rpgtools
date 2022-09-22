import {DataTypes, Model, Sequelize} from "sequelize";
import {ACL_ENTRY, ROLE, USER} from "@rpgtools/common/src/type-constants";
import {ALL_PERMISSIONS} from "@rpgtools/common/src/permission-constants";


export default class AclEntryModel extends Model {
    static connect(connection: Sequelize) {
        AclEntryModel.init({
            _id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
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
        }, {sequelize: connection, modelName: ACL_ENTRY});
    }
}