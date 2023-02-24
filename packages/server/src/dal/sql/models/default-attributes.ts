import {DataTypes, ModelAttributes} from "sequelize";

export const defaultAttributes: ModelAttributes = {
    _id: {
        type: DataTypes.UUID,
        primaryKey: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
};
