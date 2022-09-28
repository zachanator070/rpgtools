import {DataTypes, Model, Sequelize} from "sequelize";
import {defaultAttributes} from "./default-attributes";
import {ANON_USERNAME} from "@rpgtools/common/src/permission-constants";
import WorldModel from "./world-model";
import {RoleModel} from "./role-model";


export default class UserModel extends Model{
    static attributes = Object.assign({}, defaultAttributes, {
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
            allowNull: false
        },
    });

    static connect() {
        UserModel.belongsTo(WorldModel, {foreignKey: 'currentWorld'});
        RoleModel.belongsToMany(UserModel, {through: 'UserToRole'});
    }
}