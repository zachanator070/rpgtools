import {DataTypes, Model, Sequelize} from "sequelize";


export default class ChunkModel extends Model {
    static connect(connection: Sequelize) {
        ChunkModel.init({
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
            },
            width: {
                type: DataTypes.FLOAT,
                allowNull: false
            },
            height: {
                type: DataTypes.FLOAT,
                allowNull: false
            }
        }, {sequelize: connection});
    }
}