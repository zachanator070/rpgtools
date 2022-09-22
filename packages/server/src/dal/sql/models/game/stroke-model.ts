import {DataTypes, Model, Sequelize} from "sequelize";


export default class StrokeModel extends Model {
    static connect(connection: Sequelize) {
        StrokeModel.init({
            _id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            color: {
                type: DataTypes.STRING,
            },
            size: {
                type: DataTypes.FLOAT,
            },
            fill: {
                type: DataTypes.BOOLEAN
            },
            type: {
                type: DataTypes.STRING,
                validate: {
                    isIn: {
                        args: [["circle", "square", "erase", "line"]],
                        msg: `type is not one of the following values: ${["circle", "square", "erase", "line"]}`
                    }
                }
            }
        }, {sequelize: connection});
    }
}