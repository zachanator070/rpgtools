import {DataTypes, Model, Sequelize} from "sequelize";


export default class ItemModel extends Model {
    static connect(connection: Sequelize) {
        ItemModel.init({
            _id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
        }, {sequelize: connection});
    }
}