import {DataTypes, Model} from "sequelize";
import {defaultAttributes} from "./default-attributes";
import WorldModel from "./world-model";
import configPermissionControlledModel from "./config-permission-controlled-model";


export class RoleModel extends Model {
    static attributes = Object.assign({}, defaultAttributes, {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    static connect() {
        RoleModel.belongsTo(WorldModel, {foreignKey: 'world'});
        configPermissionControlledModel(RoleModel);
    }
}