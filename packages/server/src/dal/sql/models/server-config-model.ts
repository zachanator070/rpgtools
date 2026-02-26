import {
    BelongsToManyGetAssociationsMixin, BelongsToManySetAssociationsMixin,
    DataTypes,
} from "sequelize";
import {defaultAttributes} from "./default-attributes.js";
import UserModel from "./user-model.js";
import PermissionControlledModel, {configPermissionControlledModel} from "./permission-controlled-model.js";
import WorldModel from "./world-model.js";
import {WORLD} from "@rpgtools/common/src/type-constants.js";
import AdminUsersToServerConfigModel from "./admin-users-to-server-config-model.js";


export default class ServerConfigModel extends PermissionControlledModel {

    declare version: string;
    declare unlockCode: string;
    declare defaultWorldId: string;

    declare getAdmins: BelongsToManyGetAssociationsMixin<UserModel>;
    declare setAdmins: BelongsToManySetAssociationsMixin<UserModel, string>;

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
        ServerConfigModel.belongsTo(WorldModel, {as: 'defaultWorld'});
    }
}