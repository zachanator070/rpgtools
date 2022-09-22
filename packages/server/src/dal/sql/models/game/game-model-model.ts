import {DataTypes, Model, Sequelize} from "sequelize";


export default class GameModelModel extends Model {
    static connect(connection: Sequelize) {
        GameModelModel.init({
            _id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            x: {
                type: DataTypes.FLOAT,
                allowNull: false
            },
            z: {
                type: DataTypes.FLOAT,
                allowNull: false
            },
            lookAtX: {
                type: DataTypes.FLOAT,
                allowNull: false
            },
            lookAtZ: {
                type: DataTypes.FLOAT,
                allowNull: false
            },
            color: {
                type: DataTypes.STRING,
            }
        }, {sequelize: connection});
    }
}