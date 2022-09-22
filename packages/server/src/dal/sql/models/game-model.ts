

import {DataTypes, Model, Sequelize} from "sequelize";


export default class GameModel extends Model {
    static connect(connection: Sequelize) {
        GameModel.init({
            _id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            passwordHash: {
                type: DataTypes.STRING
            }
        }, {sequelize: connection});
    }
}