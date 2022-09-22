import {DataTypes, Model, Sequelize} from "sequelize";


export default class FogStrokeModel extends Model {
    static connect(connection: Sequelize) {
        FogStrokeModel.init({
            _id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            size: {
                type: DataTypes.FLOAT,
            },
            type: {
                type: DataTypes.STRING,
                validate: {
                    isIn: {
                        args: [["fog", "erase"]],
                        msg: `type is not one of the following values: ${["fog", "erase"]}`
                    }
                }
            }
        }, {sequelize: connection});
    }
}