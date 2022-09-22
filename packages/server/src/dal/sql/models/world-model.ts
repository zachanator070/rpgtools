import {DataTypes, Model, Sequelize} from "sequelize";
import {WORLD} from "@rpgtools/common/src/type-constants";


export default class World extends Model {
    static connect(connection: Sequelize) {
        World.init({
            _id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            
        }, {sequelize: connection, modelName: WORLD});
    }
}