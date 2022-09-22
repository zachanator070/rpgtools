

import {DataTypes, Model, Sequelize} from "sequelize";


export default class PathNodeModel extends Model {
    static connect(connection: Sequelize) {
        PathNodeModel.init({
            _id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            x: {
                type: DataTypes.FLOAT,
                allowNull: false
            },
            y: {
                type: DataTypes.FLOAT,
                allowNull: false
            }
        }, {sequelize: connection});
    }
}