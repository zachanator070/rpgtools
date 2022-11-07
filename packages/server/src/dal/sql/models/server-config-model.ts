import {
    BelongsToManyGetAssociationsMixin, BelongsToManySetAssociationsMixin,
    DataTypes, HasManyGetAssociationsMixin, HasManySetAssociationsMixin,
} from "sequelize";
import {defaultAttributes} from "./default-attributes";
import UserModel from "./user-model";
import PermissionControlledModel, {configPermissionControlledModel} from "./permission-controlled-model";
import RegisterCodeModel from "./register-code-model";


export default class ServerConfigModel extends PermissionControlledModel {

    declare version: string;
    declare unlockCode: string;

    getAdmins: BelongsToManyGetAssociationsMixin<UserModel>;
    setAdmins: BelongsToManySetAssociationsMixin<UserModel, string>;

    getCodes: HasManyGetAssociationsMixin<RegisterCodeModel>;
    setCodes: HasManySetAssociationsMixin<RegisterCodeModel, string>;

    static attributes = {
        ...defaultAttributes,
        version: {
            type: DataTypes.STRING,
            allowNull: false
        },
        unlockCode: {
            type: DataTypes.STRING,
            allowNull: false
        }
    };

    static connect() {
        configPermissionControlledModel(ServerConfigModel);
        ServerConfigModel.belongsToMany(UserModel, {as: 'admins', through: 'AdminUsersToServerConfig'});
        ServerConfigModel.hasMany(RegisterCodeModel, {as: 'codes'});
    }
}