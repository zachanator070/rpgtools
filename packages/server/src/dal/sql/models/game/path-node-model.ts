

import {DataTypes, Model} from "sequelize";
import {defaultAttributes} from "../default-attributes";
import SqlModel from "../sql-model";
import {FOG_STROKE, STROKE} from "@rpgtools/common/src/type-constants";


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