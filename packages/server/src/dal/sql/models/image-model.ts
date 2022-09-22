import {DataTypes, Model, Sequelize} from "sequelize";


export default class ImageModel extends Model {
    static connect(connection: Sequelize) {
        ImageModel.init({
            _id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            width: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            height: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            chunkWidth: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            chunkHeight: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            }
        }, {sequelize: connection});
    }
}