import {DataTypes, fn, ModelAttributes} from "sequelize";

export const defaultAttributes: ModelAttributes = {
    _id: {
        type: DataTypes.UUID,
        defaultValue: fn('gen_random_uuid'),
        primaryKey: true,
    }
};
