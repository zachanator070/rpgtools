import {DataTypes, Model, Sequelize} from "sequelize";


export default class CharacterModel extends Model {
    static connect(connection: Sequelize) {
        CharacterModel.init({
            _id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            color: {
                type: DataTypes.STRING,
                allowNull: false,
            },

        }, {sequelize: connection});
    }
}