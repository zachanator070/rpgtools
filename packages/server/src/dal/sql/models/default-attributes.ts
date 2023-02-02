import {DataTypes, fn, ModelAttributes} from "sequelize";

export const defaultAttributes: ModelAttributes = {
    _id: {
        type: DataTypes.UUID,
        primaryKey: true,
    }
};
