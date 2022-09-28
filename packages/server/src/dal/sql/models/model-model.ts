import {DataTypes, Model} from "sequelize";
import {defaultAttributes} from "./default-attributes";
import WorldModel from "./world-model";
import configPermissionControlledModel from "./config-permission-controlled-model";

export default class ModelModel extends Model {
    static attributes = Object.assign({}, defaultAttributes, {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        depth: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        width: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        height: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        fileName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        notes: {
            type: DataTypes.STRING,
            allowNull: false
        },
    });

    static connect() {
        ModelModel.belongsTo(WorldModel, {foreignKey: 'world'});
        configPermissionControlledModel(ModelModel);
    }
}