import {DataTypes} from "sequelize";
import {defaultAttributes} from "./default-attributes";
import WorldModel from "./world-model";
import PermissionControlledModel, {configPermissionControlledModel} from "./permission-controlled-model";
import FileModel from "./file-model";

export default class ModelModel extends PermissionControlledModel {

    declare name: string;
    declare depth: number;
    declare width: number;
    declare height: number;
    declare fileName: string;
    declare notes: string;
    declare fileId: string;
    declare worldId: string;

    static attributes = {
        ...defaultAttributes,
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        depth: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        width: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        height: {
            type: DataTypes.FLOAT,
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
    };

    static connect() {
        ModelModel.belongsTo(WorldModel, {as: 'world'});
        ModelModel.belongsTo(FileModel, {as: 'file'});
        configPermissionControlledModel(ModelModel);
    }
}