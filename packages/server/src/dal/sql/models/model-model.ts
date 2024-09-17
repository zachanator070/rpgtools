import {DataTypes} from "sequelize";
import {defaultAttributes} from "./default-attributes.js";
import WorldModel from "./world-model.js";
import PermissionControlledModel, {configPermissionControlledModel} from "./permission-controlled-model.js";
import FileModel from "./file-model.js";
import {FILE, WORLD} from "@rpgtools/common/src/type-constants.js";

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
        worldId: {
            type: DataTypes.UUID,
            references: {
                model: WORLD,
                key: '_id'
            }
        },
        fileId: {
            type: DataTypes.UUID,
            references: {
                model: FILE,
                key: '_id'
            }
        }
    };

    static connect() {
        ModelModel.belongsTo(WorldModel, {as: 'world'});
        ModelModel.belongsTo(FileModel, {as: 'file'});
        configPermissionControlledModel(ModelModel);
    }
}