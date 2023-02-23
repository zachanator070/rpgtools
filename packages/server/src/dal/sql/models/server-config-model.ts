import {
    BelongsToManyGetAssociationsMixin, BelongsToManySetAssociationsMixin,
    DataTypes, HasManyGetAssociationsMixin, HasManySetAssociationsMixin,
} from "sequelize";
import {defaultAttributes} from "./default-attributes";
import UserModel from "./user-model";
import PermissionControlledModel, {configPermissionControlledModel} from "./permission-controlled-model";
import RegisterCodeModel from "./register-code-model";
import WorldModel from "./world-model";
import {WORLD} from "@rpgtools/common/src/type-constants";
import AdminUsersToServerConfigModel from "./admin-users-to-server-config-model";


export default class ServerConfigModel extends PermissionControlledModel {

    declare version: string;
    declare unlockCode: string;
    declare defaultWorldId: string;

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
        },
        defaultWorldId: {
            type: DataTypes.UUID,
            references: {
                model: WORLD,
                key: '_id'
            }
        }
    };

    static connect() {
        configPermissionControlledModel(ServerConfigModel);
        ServerConfigModel.belongsToMany(UserModel, {as: 'admins', through: AdminUsersToServerConfigModel});
        ServerConfigModel.hasMany(RegisterCodeModel, {as: 'codes'});
        ServerConfigModel.belongsTo(WorldModel, {as: 'defaultWorld'});
    }
}