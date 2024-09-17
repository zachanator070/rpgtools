import {DataTypes} from "sequelize";
import {defaultAttributes} from "./default-attributes.js";
import WorldModel from "./world-model.js";
import PermissionControlledModel, {configPermissionControlledModel} from "./permission-controlled-model.js";
import {WORLD} from "@rpgtools/common/src/type-constants.js";


export class RoleModel extends PermissionControlledModel {

    declare name: string;
    declare worldId: string;

    static attributes = {
        ...defaultAttributes,
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        worldId: {
            type: DataTypes.UUID,
            references: {
                model: WORLD,
                key: '_id'
            }
        }
    };

    static connect() {
        RoleModel.belongsTo(WorldModel, {as: 'world'});
        configPermissionControlledModel(RoleModel);
    }
}