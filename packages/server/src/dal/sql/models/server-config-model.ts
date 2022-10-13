import {BelongsToManyGetAssociationsMixin, DataTypes, Model} from "sequelize";
import {defaultAttributes} from "./default-attributes";
import UserModel from "./user-model";
import PermissionControlledModel, {configPermissionControlledModel} from "./permission-controlled-model";


export default class ServerConfigModel extends PermissionControlledModel {

    declare version: string;
    declare registerCodes: string;
    declare unlockCode: string;

    getAdmins: BelongsToManyGetAssociationsMixin<UserModel>;

    static attributes = {
        ...defaultAttributes,
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
    };

    static connect() {
        configPermissionControlledModel(ServerConfigModel);
        ServerConfigModel.belongsToMany(UserModel, {as: 'admins', through: 'AdminUsersToServerConfig'});
    }
}