import {
    BelongsToManyGetAssociationsMixin,
    BelongsToManySetAssociationsMixin,
    DataTypes, HasManyGetAssociationsMixin, HasManySetAssociationsMixin,
} from "sequelize";
import {defaultAttributes} from "./default-attributes.js";
import {ANON_USERNAME} from "@rpgtools/common/src/permission-constants.js";
import WorldModel from "./world-model.js";
import {RoleModel} from "./role-model.js";
import SqlModel from "./sql-model.js";
import UserToRoleModel from "./user-to-role-model.js";
import {WORLD} from "@rpgtools/common/src/type-constants.js";
import { GenericRpgToolsAPIError, RpgToolsAPIError } from "../../../errors.js";


export default class UserModel extends SqlModel {

    declare email: string;
    declare username: string;
    declare password: string;
    declare tokenVersion: string;
    declare currentWorldId: string;

    declare getRoles: HasManyGetAssociationsMixin<RoleModel>;
    declare setRoles: HasManySetAssociationsMixin<RoleModel, string>;

    static attributes = {
        ...defaultAttributes,
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isValidUsername(value: string) {
                    if (!value || !value.trim()) {
                        throw new GenericRpgToolsAPIError('username is required');
                    }
                    if (value.trim().toLowerCase() === ANON_USERNAME.toLowerCase()) {
                        throw new GenericRpgToolsAPIError('cannot save anonymous user');
                    }
                }
            }
        },
        password: {
            type: DataTypes.STRING,
        },
        tokenVersion: {
            type: DataTypes.STRING,
        },
        currentWorldId: {
            type: DataTypes.UUID,
            references: {
                model: WORLD,
                key: '_id'
            }
        }
    };

    static connect() {
        UserModel.belongsTo(WorldModel, {as: 'currentWorld'});
        UserModel.belongsToMany(RoleModel, {as: 'roles', through: UserToRoleModel});
    }
}