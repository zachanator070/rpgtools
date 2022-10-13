import {DataTypes} from "sequelize";
import {defaultAttributes} from "./default-attributes";
import WorldModel from "./world-model";
import PermissionControlledModel, {configPermissionControlledModel} from "./permission-controlled-model";


export class RoleModel extends PermissionControlledModel {

    declare name: string;
    declare worldId: string;

    static attributes = {
        ...defaultAttributes,
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    };

    static connect() {
        RoleModel.belongsTo(WorldModel, {as: 'world'});
        configPermissionControlledModel(RoleModel);
    }
}