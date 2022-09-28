import {DataTypes, Model} from "sequelize";
import {defaultAttributes} from "./default-attributes";
import configPermissionControlledModel from "./config-permission-controlled-model";
import UserModel from "./user-model";


export default class ServerConfigModel extends Model {
    static attributes = Object.assign({}, defaultAttributes, {
        version: {
            type: DataTypes.STRING,
            allowNull: false
        },
        registerCodes: {
            type: DataTypes.STRING,
        },
        unlockCode: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    static connect() {
        configPermissionControlledModel(ServerConfigModel);
        ServerConfigModel.belongsToMany(UserModel, {through: 'AdminUsersToServerConfig'});
    }
}