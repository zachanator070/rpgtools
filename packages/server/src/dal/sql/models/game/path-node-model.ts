

import {DataTypes, Model} from "sequelize";
import {defaultAttributes} from "../default-attributes.js";
import SqlModel from "../sql-model.js";
import {FOG_STROKE, STROKE} from "@rpgtools/common/src/type-constants.js";


export default class PathNodeModel extends SqlModel {

    declare x: number;
    declare y: number;

    static attributes = {
        ...defaultAttributes,
        x: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        y: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        FogStrokeId: {
            type: DataTypes.UUID,
            references: {
                model: FOG_STROKE,
                key: '_id'
            }
        },
        StrokeId: {
            type: DataTypes.UUID,
            references: {
                model: STROKE,
                key: '_id'
            }
        }
    };

    static connect() {
    }
}