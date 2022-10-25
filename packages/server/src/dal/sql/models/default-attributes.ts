import {DataTypes, ModelAttributes} from "sequelize";

export const defaultAttributes: ModelAttributes = {
    _id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        autoIncrementIdentity: true
    }
};
