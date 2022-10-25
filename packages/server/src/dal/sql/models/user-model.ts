import {BelongsToManyGetAssociationsMixin, DataTypes, Model, Sequelize} from "sequelize";
import {defaultAttributes} from "./default-attributes";
import {ANON_USERNAME} from "@rpgtools/common/src/permission-constants";
import WorldModel from "./world-model";
import {RoleModel} from "./role-model";
import SqlModel from "./sql-model";


export default class UserModel extends SqlModel {

    declare email: string;
    declare username: string;
    declare password: string;
    declare tokenVersion: string;
    declare currentWorldId: string;

    getRoles: BelongsToManyGetAssociationsMixin<RoleModel>;

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
                not: {args: ANON_USERNAME, msg: 'cannot save anonymous user'}
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        tokenVersion: {
            type: DataTypes.STRING,
        },
    };

    static connect() {
        UserModel.belongsTo(WorldModel, {as: 'currenWorld'});
        RoleModel.belongsToMany(UserModel, {as: 'roles', through: 'UserToRole'});
    }
}