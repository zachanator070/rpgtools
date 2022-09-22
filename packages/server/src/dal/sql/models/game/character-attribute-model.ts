import {DataTypes, Model, Sequelize} from "sequelize";


export default class CharacterAttributeModel extends Model {
    static connect(connection: Sequelize) {
        CharacterAttributeModel.init({
            _id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            value: {
                type: DataTypes.FLOAT,
                allowNull: false
            }
        }, {sequelize: connection});
    }
}